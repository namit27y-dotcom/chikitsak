from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.appointment import Appointment
from app.models.care_plan import CarePlan
from app.models.discharge_report import DischargeReport
from app.models.medication import Medication
from app.models.user import User
from app.services.ai_service import generate_care_plan_from_text
from app.services.document_service import (
    extract_text_from_document,
    save_private_upload,
    validate_and_read_upload,
)
from app.services.validation_service import (
    VERIFIED_STATUS,
    validate_care_plan_against_source,
)


def process_discharge_report_upload(
    db: Session,
    user: User,
    filename: str | None,
    content_type: str | None,
    raw_bytes: bytes,
    output_language: str = "English",
) -> DischargeReport:
    ext, detected_mime, file_hash = validate_and_read_upload(
        filename=filename,
        content_type=content_type,
        raw_bytes=raw_bytes,
    )

    stored_filename, stored_path = save_private_upload(
        raw_bytes=raw_bytes,
        ext=ext,
        user_id=user.id,
    )

    patient = user.primary_patient
    report = DischargeReport(
        user_id=user.id,
        patient_id=patient.id if patient else None,
        original_filename=Path(filename or stored_filename).name,
        stored_filename=stored_filename,
        storage_path=str(stored_path),
        mime_type=detected_mime,
        file_size_bytes=len(raw_bytes),
        file_hash=file_hash,
        output_language=output_language,
        processing_status="Uploaded",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Step 1: Extract text (PyMuPDF + OCR fallback)
    report.processing_status = "Extracting"
    db.commit()

    try:
        extracted_text, extraction_method = extract_text_from_document(
            file_path=stored_path,
            mime_type=detected_mime,
        )
        report.extracted_text = extracted_text
        report.extraction_method = extraction_method
        report.processing_status = "Processing"
        db.commit()
    except AppError as exc:
        report.processing_status = "Failed"
        report.error_message = exc.message
        db.commit()
        return report

    # Step 2: Prevent duplicate care plans if already created for this report
    existing_plan = db.scalar(
        select(CarePlan).where(CarePlan.discharge_report_id == report.id)
    )
    if existing_plan is not None:
        report.processing_status = "Completed"
        db.commit()
        return report

    # Step 3: Gemini AI Care Plan generation
    try:
        ai_payload = generate_care_plan_from_text(
            extracted_text=extracted_text,
            requested_language=output_language,
        )
    except AppError as exc:
        report.processing_status = "Failed"
        report.error_message = exc.message
        db.commit()
        return report

    # Step 4: Deterministic Medical Safety & Validation
    validation = validate_care_plan_against_source(
        source_text=extracted_text,
        plan=ai_payload,
    )

    care_plan = CarePlan(
        user_id=user.id,
        patient_id=patient.id if patient else None,
        discharge_report_id=report.id,
        title=f"Care Plan — {report.original_filename}",
        output_language=ai_payload.output_language,
        patient_summary=ai_payload.patient_summary,
        original_excerpt=extracted_text[:4000],
        diagnosis_json=ai_payload.diagnosis,
        care_instructions_json=ai_payload.care_instructions,
        warning_signs_json=ai_payload.warning_signs,
        follow_up_json={
            "date": ai_payload.follow_up.date,
            "instructions": ai_payload.follow_up.instructions,
        },
        unclear_information_json=ai_payload.unclear_information,
        validation_status=validation.validation_status,
        validation_notes_json=validation.validation_notes,
    )
    db.add(care_plan)
    db.flush()

    for idx, med in enumerate(ai_payload.medications):
        med_val = (
            validation.medication_results[idx]
            if idx < len(validation.medication_results)
            else None
        )
        db.add(
            Medication(
                user_id=user.id,
                care_plan_id=care_plan.id,
                medicine_name=med.medicine_name or "Unspecified Medication",
                dosage=med.dosage,
                frequency=med.frequency,
                duration=med.duration,
                administration_time=med.administration_time,
                additional_instructions=med.additional_instructions,
                verified_against_source=med_val.verified if med_val else False,
                validation_note=med_val.note if med_val else None,
                taken_today=False,
            )
        )

    if ai_payload.follow_up.date:
        db.add(
            Appointment(
                user_id=user.id,
                care_plan_id=care_plan.id,
                doctor_name="Follow-up Physician",
                hospital_name="Discharge Hospital",
                appointment_date=ai_payload.follow_up.date,
                appointment_notes=ai_payload.follow_up.instructions or None,
                status="Upcoming",
            )
        )

    report.processing_status = (
        "Completed"
        if validation.validation_status == VERIFIED_STATUS
        else "Validation Required"
    )
    db.commit()
    db.refresh(report)
    return report
