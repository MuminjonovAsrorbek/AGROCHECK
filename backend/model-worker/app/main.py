import asyncio
import logging
import requests
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .predictor import get_predictor

logger = logging.getLogger(__name__)
_executor = ThreadPoolExecutor(max_workers=1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model in background thread — server starts immediately
    loop = asyncio.get_event_loop()
    loop.run_in_executor(_executor, _load_model)
    yield


def _load_model():
    try:
        get_predictor()
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error("Model load failed: %s", e, exc_info=True)


app = FastAPI(title="Agrocheck Model Worker", lifespan=lifespan)


class PredictRequest(BaseModel):
    image_url: str


@app.post("/predict")
async def predict(req: PredictRequest):
    from .predictor import _predictor
    if _predictor is None:
        raise HTTPException(status_code=503, detail="Model is still loading, please retry in a moment")
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(_executor, _predictor.predict, req.image_url)
        return result
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
