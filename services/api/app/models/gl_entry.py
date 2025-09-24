from __future__ import annotations

from datetime import date
from sqlalchemy import String, Numeric, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class GLEntry(Base):
    __tablename__ = "gl_entry"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    entity_id: Mapped[str] = mapped_column(String, ForeignKey("entity.id"), nullable=False)
    account: Mapped[str] = mapped_column(String, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    source_ref: Mapped[str] = mapped_column(String, nullable=True)


