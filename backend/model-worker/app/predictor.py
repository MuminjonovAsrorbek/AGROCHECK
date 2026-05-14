# backend/model-worker/app/predictor.py
import os
import ipaddress
import urllib.parse
import requests
from io import BytesIO
from PIL import Image
import torch
from transformers import AutoProcessor, AutoModelForCausalLM

MAX_IMAGE_BYTES = 50 * 1024 * 1024  # 50 MB

MODEL_NAME = "deadbear34/qwen35-4b-plantdisease-cpt"

# Known disease classes (PlantVillage dataset)
DISEASE_CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy",
    "Squash___Powdery_mildew", "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
    "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy",
]

LATIN_NAMES = {
    "Early_blight": "Alternaria solani",
    "Late_blight": "Phytophthora infestans",
    "Septoria_leaf_spot": "Septoria lycopersici",
    "Apple_scab": "Venturia inaequalis",
    "Cedar_apple_rust": "Gymnosporangium juniperi-virginianae",
    "Black_rot": "Botryosphaeria obtusa",
    "Powdery_mildew": "Podosphaera clandestina",
}


class PlantDiseasePredictor:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if torch.cuda.is_available() else torch.float32

        self.processor = AutoProcessor.from_pretrained(MODEL_NAME, trust_remote_code=True)
        self.model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=dtype,
            device_map="auto",
            trust_remote_code=True,
        )
        self.model.eval()

    def _load_image(self, image_url: str) -> Image.Image:
        parsed = urllib.parse.urlparse(image_url)
        if parsed.scheme not in ("http", "https"):
            raise ValueError(f"Unsupported URL scheme: {parsed.scheme}")

        # Allow internal minio (minio hostname) — reject other private IPs
        hostname = parsed.hostname or ""
        if hostname not in ("minio", "localhost", "127.0.0.1"):
            try:
                addr = ipaddress.ip_address(hostname)
                if addr.is_private:
                    raise ValueError(f"Private IP not allowed: {hostname}")
            except ValueError as e:
                if "Private IP" in str(e):
                    raise
                # hostname is a domain name, allow it

        response = requests.get(image_url, timeout=30, stream=True)
        response.raise_for_status()

        data = b""
        for chunk in response.iter_content(chunk_size=8192):
            data += chunk
            if len(data) > MAX_IMAGE_BYTES:
                raise ValueError("Image too large (max 50 MB)")

        return Image.open(BytesIO(data)).convert("RGB")

    def _parse_class(self, class_name: str) -> dict:
        parts = class_name.split("___")
        plant = parts[0].replace("_", " ") if len(parts) > 0 else "Unknown"
        disease_raw = parts[1] if len(parts) > 1 else "Unknown"
        is_healthy = "healthy" in disease_raw.lower()
        disease_display = "Healthy" if is_healthy else disease_raw.replace("_", " ").strip()

        latin = None
        for key, val in LATIN_NAMES.items():
            if key.lower() in disease_raw.lower():
                latin = val
                break

        severity = "healthy" if is_healthy else "moderate"
        return {
            "plant": plant,
            "disease": disease_display,
            "disease_latin": latin,
            "severity": severity,
            "is_healthy": is_healthy,
        }

    def predict(self, image_url: str) -> dict:
        image = self._load_image(image_url)

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {
                        "type": "text",
                        "text": (
                            "Classify the plant disease in this image. "
                            "Return the class name from PlantVillage dataset format "
                            "(e.g. Tomato___Early_blight). "
                            "Also provide top-3 predictions with confidence scores as JSON."
                        ),
                    },
                ],
            }
        ]

        text = self.processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        inputs = self.processor(
            text=[text], images=[image], return_tensors="pt"
        ).to(self.device)

        with torch.no_grad():
            output_ids = self.model.generate(**inputs, max_new_tokens=256, temperature=0.1)

        generated = self.processor.decode(
            output_ids[0][inputs["input_ids"].shape[1]:],
            skip_special_tokens=True,
        )

        return self._structure_output(generated)

    def _structure_output(self, raw_output: str) -> dict:
        import json, re

        # Try to extract JSON block
        json_match = re.search(r"\{.*\}", raw_output, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group())
                top_class = parsed.get("top_class", "Tomato___healthy")
                predictions = parsed.get("predictions", [])
            except Exception:
                top_class = "Tomato___healthy"
                predictions = []
        else:
            # fallback: find class name pattern
            match = re.search(r"([A-Z][a-z]+(?:_[a-z]+)*___[A-Za-z_]+)", raw_output)
            top_class = match.group(1) if match else "Tomato___healthy"
            predictions = []

        info = self._parse_class(top_class)
        confidence = predictions[0].get("confidence", 85.0) if predictions else 85.0

        structured_predictions = []
        for p in predictions[:4]:
            cls = p.get("class", top_class)
            c_info = self._parse_class(cls)
            structured_predictions.append({
                "name": c_info["disease"],
                "latin": c_info["disease_latin"],
                "confidence": round(float(p.get("confidence", 0)), 1),
            })

        if not structured_predictions:
            structured_predictions = [
                {"name": info["disease"], "latin": info["disease_latin"], "confidence": confidence}
            ]

        return {
            "disease": info["disease"],
            "disease_latin": info["disease_latin"],
            "plant": info["plant"],
            "confidence": round(float(confidence), 1),
            "severity": info["severity"],
            "is_healthy": info["is_healthy"],
            "predictions": structured_predictions,
        }


_predictor: PlantDiseasePredictor | None = None


def get_predictor() -> PlantDiseasePredictor:
    global _predictor
    if _predictor is None:
        _predictor = PlantDiseasePredictor()
    return _predictor
