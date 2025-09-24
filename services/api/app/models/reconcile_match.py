from __future__ import annotations

from sqlalchemy import String, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class ReconcileMatch(Base):
    __tablename__ = "reconcile_match"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    gl_entry_id: Mapped[str] = mapped_column(String, ForeignKey("gl_entry.id"), nullable=False)
    bank_txn_id: Mapped[str] = mapped_column(String, ForeignKey("bank_txn.id"), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    status: Mapped[str] = mapped_column(String, nullable=False, default="matched")
    receipt_id: Mapped[str | None] = mapped_column(String, nullable=True)


