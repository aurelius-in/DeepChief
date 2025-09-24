from __future__ import annotations

from datetime import date
from sqlalchemy import String, Numeric, Date, JSON
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class BankTxn(Base):
    __tablename__ = "bank_txn"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    account_ref: Mapped[str] = mapped_column(String, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)


