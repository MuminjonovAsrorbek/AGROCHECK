import uuid
from datetime import datetime
from pydantic import BaseModel


class PredictionItem(BaseModel):
    name: str
    latin: str | None
    confidence: float


class ScanOut(BaseModel):
    id: uuid.UUID
    image_url: str
    plant: str
    disease_name: str
    disease_latin: str | None
    confidence: float
    severity: str
    is_healthy: bool
    predictions: list[PredictionItem]
    created_at: datetime

    model_config = {"from_attributes": True}


class ScanListItem(BaseModel):
    id: uuid.UUID
    plant: str
    disease_name: str
    confidence: float
    severity: str
    is_healthy: bool
    created_at: datetime
    image_url: str

    model_config = {"from_attributes": True}
