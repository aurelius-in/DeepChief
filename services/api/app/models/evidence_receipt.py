from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class EvidenceReceipt(Base):
    __tablename__ = "evidence_receipt"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    sha256_b64: Mapped[str] = mapped_column(String, nullable=False)
    signed_hash_b64: Mapped[str] = mapped_column(String, nullable=False)
    public_key_b64: Mapped[str] = mapped_column(String, nullable=False)
    payload_url: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


