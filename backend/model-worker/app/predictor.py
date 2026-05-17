import ipaddress
import json
import urllib.parse
from io import BytesIO
from pathlib import Path

import numpy as np
import onnxruntime as ort
import requests
from PIL import Image

MAX_IMAGE_BYTES = 50 * 1024 * 1024

IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

SEVERITY_MAP = {
    "healthy":       "healthy",
    "scab":          "moderate",
    "black rot":     "severe",
    "rust":          "moderate",
    "powdery":       "moderate",
    "blight":        "moderate",
    "late blight":   "severe",
    "northern":      "severe",
    "esca":          "severe",
    "huanglongbing": "severe",
    "greening":      "severe",
    "bacterial":     "moderate",
    "mold":          "mild",
    "septoria":      "moderate",
    "spider":        "mild",
    "target":        "moderate",
    "mosaic":        "moderate",
    "yellow leaf":   "severe",
    "curl":          "severe",
    "scorch":        "moderate",
}


def _parse_class_name(class_dir: str):
    parts = class_dir.split("___", 1)
    plant   = parts[0].replace("_", " ").replace(",", "").strip()
    disease = parts[1].replace("_", " ").strip().title() if len(parts) > 1 else "Unknown"
    is_healthy = "healthy" in disease.lower()
    severity = "healthy"
    if not is_healthy:
        disease_lower = disease.lower()
        for keyword, sev in SEVERITY_MAP.items():
            if keyword in disease_lower:
                severity = sev
                break
        else:
            severity = "moderate"
    return plant, disease, is_healthy, severity


class PlantDiseasePredictor:
    def __init__(self):
        model_dir  = Path(__file__).parent / "models"
        onnx_path  = model_dir / "plant_disease_model.onnx"
        class_path = model_dir / "classes.json"

        if not onnx_path.exists():
            raise FileNotFoundError(
                f"ONNX model not found at {onnx_path}.\n"
                "Run training first:\n"
                "  cd training && python train.py\n"
                "  python export.py --checkpoint output/best_model.pth\n"
                "Then copy output/*.onnx and output/classes.json to model-worker/app/models/"
            )

        self._session = ort.InferenceSession(
            str(onnx_path),
            providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
        )
        self._input_name = self._session.get_inputs()[0].name

        with open(class_path) as f:
            self._classes = json.load(f)

        self._class_meta = [_parse_class_name(c) for c in self._classes]
        self.ready = True
        print(f"[predictor] ONNX model loaded ({len(self._classes)} classes)")

    def _preprocess(self, image_data: bytes) -> np.ndarray:
        img = Image.open(BytesIO(image_data)).convert("RGB")
        w, h = img.size
        short = min(w, h)
        scale = 256 / short
        new_w, new_h = int(w * scale), int(h * scale)
        img = img.resize((new_w, new_h), Image.BILINEAR)
        left = (new_w - 224) // 2
        top  = (new_h - 224) // 2
        img = img.crop((left, top, left + 224, top + 224))

        arr = np.array(img, dtype=np.float32) / 255.0
        arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
        arr = arr.transpose(2, 0, 1)[np.newaxis]
        return arr

    def _load_image(self, image_url: str) -> bytes:
        parsed = urllib.parse.urlparse(image_url)
        if parsed.scheme not in ("http", "https"):
            raise ValueError(f"Unsupported URL scheme: {parsed.scheme}")
        hostname = parsed.hostname or ""
        if hostname not in ("minio", "localhost", "127.0.0.1"):
            try:
                addr = ipaddress.ip_address(hostname)
                if addr.is_private:
                    raise ValueError(f"Private IP not allowed: {hostname}")
            except ValueError as e:
                if "Private IP" in str(e):
                    raise
        response = requests.get(image_url, timeout=30, stream=True)
        response.raise_for_status()
        data = b""
        for chunk in response.iter_content(8192):
            data += chunk
            if len(data) > MAX_IMAGE_BYTES:
                raise ValueError("Image too large (max 50 MB)")
        return data

    def predict(self, image_url: str) -> dict:
        image_data = self._load_image(image_url)

        try:
            Image.open(BytesIO(image_data)).verify()
        except Exception:
            raise ValueError("Invalid or corrupted image file")

        inp    = self._preprocess(image_data)
        logits = self._session.run(None, {self._input_name: inp})[0][0]
        probs  = self._softmax(logits)

        top4_idx = np.argsort(probs)[::-1][:4]
        top_idx  = int(top4_idx[0])

        plant, disease, is_healthy, severity = self._class_meta[top_idx]
        confidence = round(float(probs[top_idx]) * 100, 1)

        predictions = []
        for idx in top4_idx:
            p, d, _, _ = self._class_meta[int(idx)]
            predictions.append({
                "name":       f"{p} · {d}",
                "latin":      None,
                "confidence": round(float(probs[idx]) * 100, 1),
            })

        return {
            "disease":       disease,
            "disease_latin": None,
            "plant":         plant,
            "confidence":    confidence,
            "severity":      severity,
            "is_healthy":    is_healthy,
            "predictions":   predictions,
        }

    @staticmethod
    def _softmax(x: np.ndarray) -> np.ndarray:
        e = np.exp(x - x.max())
        return e / e.sum()


_predictor: PlantDiseasePredictor | None = None


def get_predictor() -> PlantDiseasePredictor:
    global _predictor
    if _predictor is None:
        _predictor = PlantDiseasePredictor()
    return _predictor
