"""
Unit tests for scan router constants and schema validation.
The router imports sqlalchemy/minio at module level, so we stub those
before any app code is imported.
"""
import sys
import types
from unittest.mock import MagicMock, AsyncMock, patch

# ── external package stubs ────────────────────────────────────────────────────
for mod in ("minio", "minio.error", "pydantic_settings", "asyncpg", "httpx"):
    sys.modules.setdefault(mod, MagicMock())

# stub sqlalchemy.ext.asyncio so create_async_engine doesn't blow up
_sa_async = types.ModuleType("sqlalchemy.ext.asyncio")
_sa_async.create_async_engine = MagicMock(return_value=MagicMock())
_sa_async.async_sessionmaker = MagicMock(return_value=MagicMock())
_sa_async.AsyncSession = MagicMock()
sys.modules["sqlalchemy.ext.asyncio"] = _sa_async

# ── now safe to import app code ───────────────────────────────────────────────
import pytest
import uuid
from datetime import datetime, timezone
from fastapi import HTTPException
from app.schemas.scan import PredictionItem, ScanOut, ScanListItem


# ── schema tests ──────────────────────────────────────────────────────────────

def test_prediction_item_schema():
    item = PredictionItem(name="Powdery Mildew", latin="Erysiphe cichoracearum", confidence=0.91)
    assert item.name == "Powdery Mildew"
    assert item.confidence == 0.91


def test_prediction_item_latin_optional():
    item = PredictionItem(name="Healthy", latin=None, confidence=0.99)
    assert item.latin is None


def test_scan_list_item_schema():
    item = ScanListItem(
        id=uuid.uuid4(),
        plant="Tomato",
        disease_name="Late Blight",
        confidence=0.87,
        severity="severe",
        is_healthy=False,
        created_at=datetime.now(timezone.utc),
        image_url="http://minio:9000/agrocheck-scans/scans/test.jpg",
    )
    assert item.plant == "Tomato"
    assert not item.is_healthy


# ── router constant tests ─────────────────────────────────────────────────────

def test_upload_allowed_content_types():
    from app.routers.scans import ALLOWED_CONTENT_TYPES
    assert "image/jpeg" in ALLOWED_CONTENT_TYPES
    assert "image/png" in ALLOWED_CONTENT_TYPES
    assert "image/webp" in ALLOWED_CONTENT_TYPES
    assert "application/pdf" not in ALLOWED_CONTENT_TYPES


def test_upload_max_file_size():
    from app.routers.scans import MAX_FILE_SIZE
    assert MAX_FILE_SIZE == 10 * 1024 * 1024


# ── endpoint logic tests ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_scan_exceeds_free_plan_limit():
    from app.routers.scans import upload_scan
    import app.routers.scans as scans_module

    user = MagicMock()
    user.plan = "free"
    user.scan_count_month = 10

    file = MagicMock()
    file.content_type = "image/jpeg"

    db = AsyncMock()

    # Patch settings so free_plan_monthly_limit is a real int
    real_settings = MagicMock()
    real_settings.free_plan_monthly_limit = 10
    with patch.object(scans_module, "settings", real_settings):
        with pytest.raises(HTTPException) as exc_info:
            await upload_scan(file=file, user=user, db=db)

    assert exc_info.value.status_code == 403
    assert "limit" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_upload_scan_rejects_wrong_mime():
    from app.routers.scans import upload_scan

    user = MagicMock()
    user.plan = "pro"
    user.scan_count_month = 0

    file = MagicMock()
    file.content_type = "application/pdf"
    file.read = AsyncMock(return_value=b"fake data")

    db = AsyncMock()

    with pytest.raises(HTTPException) as exc_info:
        await upload_scan(file=file, user=user, db=db)

    assert exc_info.value.status_code == 400
    assert any(t in exc_info.value.detail.lower() for t in ["jpg", "png", "webp"])
