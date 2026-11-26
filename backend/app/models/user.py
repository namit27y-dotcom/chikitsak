from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.patient import Patient
    from app.models.discharge_report import DischargeReport
    from app.models.care_plan import CarePlan
    from app.models.reminder import Reminder
    from app.models.appointment import Appointment


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(24), default="bilingual", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    patients: Mapped[List["Patient"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    discharge_reports: Mapped[List["DischargeReport"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    care_plans: Mapped[List["CarePlan"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    reminders: Mapped[List["Reminder"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    appointments: Mapped[List["Appointment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def primary_patient(self) -> Optional["Patient"]:
        return self.patients[0] if self.patients else None
