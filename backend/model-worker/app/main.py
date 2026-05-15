# backend/model-worker/app/main.py
import logging
import requests
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .predictor import get_predictor

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        get_predictor()
    except Exception as e:
        logger.error("Model warm-up failed (will retry on first request): %s", e)
    yield


app = FastAPI(title="Agrocheck Model Worker", lifespan=lifespan)


class PredictRequest(BaseModel):
    image_url: str


@app.post("/predict")
async def predict(req: PredictRequest):
    try:
        predictor = get_predictor()
        return predictor.predict(req.image_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Image fetch timed out")
    except requests.exceptions.RequestException as e:
        logger.error("Image fetch error: %s", e)
        raise HTTPException(status_code=400, detail="Failed to fetch image")
    except Exception as e:
        logger.error("Prediction error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Prediction failed")


@app.get("/health")
async def health():
    from .predictor import _predictor
    return {"status": "ok", "model_loaded": _predictor is not None}
