from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.patient import Patient
    from app.models.care_plan import CarePlan


class DischargeReport(Base, TimestampMixin):
    __tablename__ = "discharge_reports"

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
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(120), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    file_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    output_language: Mapped[str] = mapped_column(String(24), default="English", nullable=False)

    # Processing states: Uploaded, Extracting, Processing, Validation Required, Completed, Failed
    processing_status: Mapped[str] = mapped_column(
        String(40), default="Uploaded", index=True, nullable=False
    )
    extraction_method: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="discharge_reports")
    patient: Mapped[Optional["Patient"]] = relationship(back_populates="discharge_reports")
    care_plan: Mapped[Optional["CarePlan"]] = relationship(
        back_populates="discharge_report",
        uselist=False,
        cascade="all, delete-orphan",
    )
