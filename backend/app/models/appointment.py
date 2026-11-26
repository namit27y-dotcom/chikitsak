from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    care_plan_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("care_plans.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )

    doctor_name: Mapped[str] = mapped_column(String(160), nullable=False)
    hospital_name: Mapped[str] = mapped_column(String(200), nullable=False)
    appointment_date: Mapped[str] = mapped_column(String(64), nullable=False)
    appointment_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="Upcoming", index=True, nullable=False)

    user: Mapped["User"] = relationship(back_populates="appointments")
