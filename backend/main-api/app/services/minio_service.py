import io
from minio import Minio
from ..core.config import settings

_client: Minio | None = None


def get_minio() -> Minio:
    global _client
    if _client is None:
        _client = Minio(
            settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=False,
        )
        if not _client.bucket_exists(settings.minio_bucket):
            _client.make_bucket(settings.minio_bucket)
    return _client


def upload_image(data: bytes, object_name: str, content_type: str = "image/jpeg") -> str:
    client = get_minio()
    client.put_object(
        settings.minio_bucket,
        object_name,
        io.BytesIO(data),
        length=len(data),
        content_type=content_type,
    )
    return f"http://{settings.minio_endpoint}/{settings.minio_bucket}/{object_name}"


def get_presigned_url(object_name: str, expires_seconds: int = 3600) -> str:
    from datetime import timedelta
    client = get_minio()
    return client.presigned_get_object(
        settings.minio_bucket, object_name, expires=timedelta(seconds=expires_seconds)
    )
