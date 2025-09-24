from __future__ import annotations

from sqlalchemy import String, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class SpendIssue(Base):
    __tablename__ = "spend_issue"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    type: Mapped[str] = mapped_column(String, nullable=False)  # duplicate_payment | saas_waste
    vendor: Mapped[str | None] = mapped_column(String, nullable=True)
    amount: Mapped[float | None] = mapped_column(Numeric(18, 2), nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="open")
    metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    receipt_id: Mapped[str | None] = mapped_column(String, nullable=True)


