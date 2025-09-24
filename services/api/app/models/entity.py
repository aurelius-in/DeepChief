from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Entity(Base):
    __tablename__ = "entity"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    coa_map: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


