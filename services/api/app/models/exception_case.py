from __future__ import annotations

from sqlalchemy import String, JSON
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class ExceptionCase(Base):
    __tablename__ = "exception_case"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    entity_id: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    root_cause_ranked: Mapped[list] = mapped_column(JSON, nullable=False)
    proposed_fix: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="open")
    assignee: Mapped[str | None] = mapped_column(String, nullable=True)
    receipt_id: Mapped[str | None] = mapped_column(String, nullable=True)


