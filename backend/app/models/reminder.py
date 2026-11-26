from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Reminder(Base, TimestampMixin):
    __tablename__ = "reminders"

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

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    reminder_time: Mapped[str] = mapped_column(String(64), nullable=False)
    frequency: Mapped[str] = mapped_column(String(32), default="Daily", nullable=False)
    category: Mapped[str] = mapped_column(String(32), default="Medicine", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship(back_populates="reminders")
