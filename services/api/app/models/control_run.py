from __future__ import annotations

from datetime import date
from sqlalchemy import String, Date, JSON
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class ControlRun(Base):
    __tablename__ = "control_run"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    control_key: Mapped[str] = mapped_column(String, nullable=False)
    window_start: Mapped[date] = mapped_column(Date, nullable=False)
    window_end: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    findings: Mapped[dict] = mapped_column(JSON, nullable=False)
    receipt_id: Mapped[str | None] = mapped_column(String, nullable=True)


