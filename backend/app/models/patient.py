from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.discharge_report import DischargeReport
    from app.models.care_plan import CarePlan


class Patient(Base, TimestampMixin):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    blood_group: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    emergency_contact: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(24), default="bilingual", nullable=False)

    user: Mapped["User"] = relationship(back_populates="patients")
    discharge_reports: Mapped[List["DischargeReport"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    care_plans: Mapped[List["CarePlan"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
