from __future__ import annotations

from sqlalchemy import String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class PolicyVersion(Base):
    __tablename__ = "policy_version"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    key: Mapped[str] = mapped_column(String, nullable=False)
    yaml: Mapped[str] = mapped_column(Text, nullable=False)
    checksum: Mapped[str] = mapped_column(String, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


