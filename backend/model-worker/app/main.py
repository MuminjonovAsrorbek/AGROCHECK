# backend/model-worker/app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .predictor import get_predictor


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_predictor()   # warm-up: model loads at startup
    yield


app = FastAPI(title="Agrocheck Model Worker", lifespan=lifespan)


class PredictRequest(BaseModel):
    image_url: str


@app.post("/predict")
async def predict(req: PredictRequest):
    try:
        predictor = get_predictor()
        return predictor.predict(req.image_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": True}
