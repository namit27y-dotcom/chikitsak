"""Initial CHIKITSAK MySQL schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-11-26 09:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=160), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("preferred_language", sa.String(length=24), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=160), nullable=False),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("blood_group", sa.String(length=16), nullable=True),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("emergency_contact", sa.String(length=160), nullable=True),
        sa.Column("preferred_language", sa.String(length=24), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_patients_user_id", "patients", ["user_id"], unique=False)

    op.create_table(
        "discharge_reports",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.Integer(), nullable=True),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("stored_filename", sa.String(length=255), nullable=False),
        sa.Column("storage_path", sa.String(length=512), nullable=False),
        sa.Column("mime_type", sa.String(length=120), nullable=False),
        sa.Column("file_size_bytes", sa.Integer(), nullable=False),
        sa.Column("file_hash", sa.String(length=64), nullable=False),
        sa.Column("output_language", sa.String(length=24), nullable=False),
        sa.Column("processing_status", sa.String(length=40), nullable=False),
        sa.Column("extraction_method", sa.String(length=40), nullable=True),
        sa.Column("extracted_text", sa.Text(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stored_filename"),
    )
    op.create_index("ix_discharge_reports_file_hash", "discharge_reports", ["file_hash"], unique=False)
    op.create_index("ix_discharge_reports_patient_id", "discharge_reports", ["patient_id"], unique=False)
    op.create_index("ix_discharge_reports_processing_status", "discharge_reports", ["processing_status"], unique=False)
    op.create_index("ix_discharge_reports_user_id", "discharge_reports", ["user_id"], unique=False)

    op.create_table(
        "care_plans",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.Integer(), nullable=True),
        sa.Column("discharge_report_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("output_language", sa.String(length=24), nullable=False),
        sa.Column("patient_summary", sa.Text(), nullable=False),
        sa.Column("original_excerpt", sa.Text(), nullable=True),
        sa.Column("diagnosis_json", sa.JSON(), nullable=False),
        sa.Column("care_instructions_json", sa.JSON(), nullable=False),
        sa.Column("warning_signs_json", sa.JSON(), nullable=False),
        sa.Column("follow_up_json", sa.JSON(), nullable=False),
        sa.Column("unclear_information_json", sa.JSON(), nullable=False),
        sa.Column("validation_status", sa.String(length=48), nullable=False),
        sa.Column("validation_notes_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["discharge_report_id"], ["discharge_reports.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("discharge_report_id", name="uq_care_plans_discharge_report_id"),
    )
    op.create_index("ix_care_plans_discharge_report_id", "care_plans", ["discharge_report_id"], unique=False)
    op.create_index("ix_care_plans_patient_id", "care_plans", ["patient_id"], unique=False)
    op.create_index("ix_care_plans_user_id", "care_plans", ["user_id"], unique=False)
    op.create_index("ix_care_plans_validation_status", "care_plans", ["validation_status"], unique=False)

    op.create_table(
        "medications",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("care_plan_id", sa.Integer(), nullable=False),
        sa.Column("medicine_name", sa.String(length=200), nullable=False),
        sa.Column("dosage", sa.String(length=120), nullable=False),
        sa.Column("frequency", sa.String(length=120), nullable=False),
        sa.Column("duration", sa.String(length=120), nullable=False),
        sa.Column("administration_time", sa.String(length=120), nullable=False),
        sa.Column("additional_instructions", sa.Text(), nullable=True),
        sa.Column("verified_against_source", sa.Boolean(), nullable=False),
        sa.Column("validation_note", sa.String(length=255), nullable=True),
        sa.Column("taken_today", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["care_plan_id"], ["care_plans.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_medications_care_plan_id", "medications", ["care_plan_id"], unique=False)
    op.create_index("ix_medications_user_id", "medications", ["user_id"], unique=False)

    op.create_table(
        "reminders",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("care_plan_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("reminder_time", sa.String(length=64), nullable=False),
        sa.Column("frequency", sa.String(length=32), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("is_completed", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["care_plan_id"], ["care_plans.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reminders_care_plan_id", "reminders", ["care_plan_id"], unique=False)
    op.create_index("ix_reminders_user_id", "reminders", ["user_id"], unique=False)

    op.create_table(
        "appointments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("care_plan_id", sa.Integer(), nullable=True),
        sa.Column("doctor_name", sa.String(length=160), nullable=False),
        sa.Column("hospital_name", sa.String(length=200), nullable=False),
        sa.Column("appointment_date", sa.String(length=64), nullable=False),
        sa.Column("appointment_notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["care_plan_id"], ["care_plans.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_appointments_care_plan_id", "appointments", ["care_plan_id"], unique=False)
    op.create_index("ix_appointments_status", "appointments", ["status"], unique=False)
    op.create_index("ix_appointments_user_id", "appointments", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_table("appointments")
    op.drop_table("reminders")
    op.drop_table("medications")
    op.drop_table("care_plans")
    op.drop_table("discharge_reports")
    op.drop_table("patients")
    op.drop_table("users")
