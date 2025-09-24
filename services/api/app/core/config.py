import os
from pydantic import BaseModel


class Settings(BaseModel):
    postgres_url: str = os.getenv("POSTGRES_URL", "postgresql+psycopg://deepchief:deepchief@localhost:5432/deepchief")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    minio_endpoint: str = os.getenv("MINIO_ENDPOINT", "http://localhost:9000")
    minio_access_key: str = os.getenv("MINIO_ACCESS_KEY", "deepchief")
    minio_secret_key: str = os.getenv("MINIO_SECRET_KEY", "deepchiefsecret")
    minio_bucket: str = os.getenv("MINIO_BUCKET", "receipts")
    jwt_secret: str = os.getenv("JWT_SECRET", "change_me")
    env: str = os.getenv("ENV", "local")
    receipt_signing_private_key: str | None = os.getenv("RECEIPT_SIGNING_PRIVATE_KEY")
    erp_provider: str = os.getenv("ERP_PROVIDER", "netsuite_mock")
    bank_provider: str = os.getenv("BANK_PROVIDER", "bank_mock")


settings = Settings()


