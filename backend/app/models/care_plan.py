from typing import TYPE_CHECKING, Any, Dict, List, Optional

from sqlalchemy import ForeignKey, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.patient import Patient
    from app.models.discharge_report import DischargeReport
    from app.models.medication import Medication


class CarePlan(Base, TimestampMixin):
    __tablename__ = "care_plans"
    __table_args__ = (
        UniqueConstraint("discharge_report_id", name="uq_care_plans_discharge_report_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    patient_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("patients.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    discharge_report_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("discharge_reports.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    output_language: Mapped[str] = mapped_column(String(24), default="English", nullable=False)
    patient_summary: Mapped[str] = mapped_column(Text, nullable=False)
    original_excerpt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    diagnosis_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    care_instructions_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    warning_signs_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    follow_up_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    unclear_information_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    # Validation statuses: Verified Against Source, Needs Review, Incomplete Source Information
    validation_status: Mapped[str] = mapped_column(
        String(48), default="Needs Review", index=True, nullable=False
    )
    validation_notes_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    user: Mapped["User"] = relationship(back_populates="care_plans")
    patient: Mapped[Optional["Patient"]] = relationship(back_populates="care_plans")
    discharge_report: Mapped[Optional["DischargeReport"]] = relationship(
        back_populates="care_plan"
    )
    medications: Mapped[List["Medication"]] = relationship(
        back_populates="care_plan",
        cascade="all, delete-orphan",
    )
