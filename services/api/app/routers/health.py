from fastapi import APIRouter
import socket
from sqlalchemy import text
from ..core.db import engine
from ..core.config import settings
from minio import Minio


router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/health/deps")
def health_deps() -> dict:
    db_ok = False
    redis_ok = False
    minio_ok = False

    # DB
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_ok = True
    except Exception:
        db_ok = False

    # Redis
    try:
        host_port = settings.redis_url.replace("redis://", "").split("/")[0]
        host, port = host_port.split(":")
        with socket.create_connection((host, int(port)), timeout=1):
            redis_ok = True
    except Exception:
        redis_ok = False

    # MinIO
    try:
        endpoint = settings.minio_endpoint.replace("http://", "").replace("https://", "")
        secure = settings.minio_endpoint.startswith("https://")
        c = Minio(endpoint, access_key=settings.minio_access_key, secret_key=settings.minio_secret_key, secure=secure)
        # list buckets as a light check
        list(c.list_buckets())
        minio_ok = True
    except Exception:
        minio_ok = False

    return {"db": db_ok, "redis": redis_ok, "minio": minio_ok}


