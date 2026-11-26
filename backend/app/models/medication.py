from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.care_plan import CarePlan
    from app.models.user import User


class Medication(Base, TimestampMixin):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    care_plan_id: Mapped[int] = mapped_column(
        ForeignKey("care_plans.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    medicine_name: Mapped[str] = mapped_column(String(200), nullable=False)
    dosage: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    frequency: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    duration: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    administration_time: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    additional_instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    verified_against_source: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    validation_note: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    taken_today: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    care_plan: Mapped["CarePlan"] = relationship(back_populates="medications")
