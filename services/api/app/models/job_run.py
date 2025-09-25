from __future__ import annotations

from sqlalchemy import String, JSON
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class JobRun(Base):
    __tablename__ = "job_run"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    agent: Mapped[str] = mapped_column(String, nullable=False)
    inputs: Mapped[dict] = mapped_column(JSON, nullable=False)
    outputs: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="completed")
    receipt_id: Mapped[str | None] = mapped_column(String, nullable=True)


