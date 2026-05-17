import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.database import get_db
from ..core.config import settings
from ..models.user import User
from ..models.scan import Scan
from ..schemas.scan import ScanOut, ScanListItem
from ..services.minio_service import upload_image
from ..services.model_service import predict_disease
from .auth import current_user

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", response_model=ScanOut)
async def upload_scan(
    file: UploadFile = File(...),
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    # TODO: re-enable limit check before production

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG/PNG/WEBP images are allowed.")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB).")

    scan_id = uuid.uuid4()
    ext = "jpg" if "jpeg" in (file.content_type or "") else "png"
    object_name = f"scans/{user.id}/{scan_id}.{ext}"

    image_url = upload_image(data, object_name, file.content_type or "image/jpeg")

    try:
        result = await predict_disease(image_url)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Model inference failed: {str(e)}")

    scan = Scan(
        id=scan_id,
        user_id=user.id,
        image_url=image_url,
        plant=result.get("plant", "Unknown"),
        disease_name=result["disease"],
        disease_latin=result.get("disease_latin"),
        confidence=result["confidence"],
        severity=result.get("severity", "moderate"),
        is_healthy=result.get("is_healthy", False),
        predictions=result.get("predictions", []),
    )
    db.add(scan)

    user.scan_count_month += 1
    await db.commit()
    await db.refresh(scan)

    return scan


@router.get("/", response_model=list[ScanListItem])
async def list_scans(
    status: str | None = None,
    skip: int = 0,
    limit: int = 20,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Scan).where(Scan.user_id == user.id).order_by(Scan.created_at.desc())
    if status == "healthy":
        query = query.where(Scan.is_healthy == True)
    elif status == "diseased":
        query = query.where(Scan.is_healthy == False)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{scan_id}", response_model=ScanOut)
async def get_scan(
    scan_id: uuid.UUID,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    scan = await db.get(Scan, scan_id)
    if not scan or scan.user_id != user.id:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.delete("/{scan_id}", status_code=204)
async def delete_scan(
    scan_id: uuid.UUID,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    scan = await db.get(Scan, scan_id)
    if not scan or scan.user_id != user.id:
        raise HTTPException(status_code=404, detail="Scan not found")
    await db.delete(scan)
    await db.commit()
