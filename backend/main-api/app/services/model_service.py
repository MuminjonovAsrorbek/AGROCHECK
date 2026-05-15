import httpx
from ..core.config import settings


async def predict_disease(image_url: str) -> dict:
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            f"{settings.model_worker_url}/predict",
            json={"image_url": image_url},
        )
        resp.raise_for_status()
        return resp.json()
