from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.core.exceptions import AppError
from app.db.session import get_db
from app.models.discharge_report import DischargeReport
from app.models.user import User
from app.schemas.report import DischargeReportResponse, ReportStatusResponse
from app.services.care_plan_service import process_discharge_report_upload

router = APIRouter(prefix="/reports", tags=["Discharge Reports"])


def _serialize_report(report: DischargeReport) -> DischargeReportResponse:
    return DischargeReportResponse(
        id=report.id,
        original_filename=report.original_filename,
        mime_type=report.mime_type,
        file_size_bytes=report.file_size_bytes,
        output_language=report.output_language,
        processing_status=report.processing_status,
        extraction_method=report.extraction_method,
        error_message=report.error_message,
        care_plan_id=report.care_plan.id if report.care_plan else None,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )


@router.post("/upload", response_model=DischargeReportResponse, status_code=201)
async def upload_report(
    file: UploadFile = File(...),
    output_language: str = Form("English"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DischargeReportResponse:
    raw_bytes = await file.read()
    report = process_discharge_report_upload(
        db=db,
        user=current_user,
        filename=file.filename,
        content_type=file.content_type,
        raw_bytes=raw_bytes,
        output_language=output_language,
    )
    # Reload care_plan relation cleanly
    reloaded = db.scalar(
        select(DischargeReport)
        .options(selectinload(DischargeReport.care_plan))
        .where(DischargeReport.id == report.id)
    )
    return _serialize_report(reloaded or report)


@router.get("", response_model=list[DischargeReportResponse])
def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DischargeReportResponse]:
    reports = db.scalars(
        select(DischargeReport)
        .options(selectinload(DischargeReport.care_plan))
        .where(DischargeReport.user_id == current_user.id)
        .order_by(DischargeReport.created_at.desc(), DischargeReport.id.desc())
    ).all()
    return [_serialize_report(r) for r in reports]


@router.get("/{report_id}", response_model=DischargeReportResponse)
def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DischargeReportResponse:
    report = db.scalar(
        select(DischargeReport)
        .options(selectinload(DischargeReport.care_plan))
        .where(
            DischargeReport.id == report_id,
            DischargeReport.user_id == current_user.id,
        )
    )
    if report is None:
        raise AppError("Discharge report not found.", status_code=404, code="report_not_found")
    return _serialize_report(report)


@router.get("/{report_id}/status", response_model=ReportStatusResponse)
def get_report_status(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportStatusResponse:
    report = db.scalar(
        select(DischargeReport)
        .options(selectinload(DischargeReport.care_plan))
        .where(
            DischargeReport.id == report_id,
            DischargeReport.user_id == current_user.id,
        )
    )
    if report is None:
        raise AppError("Discharge report not found.", status_code=404, code="report_not_found")
    return ReportStatusResponse(
        report_id=report.id,
        processing_status=report.processing_status,
        extraction_method=report.extraction_method,
        error_message=report.error_message,
        care_plan_id=report.care_plan.id if report.care_plan else None,
        validation_status=report.care_plan.validation_status if report.care_plan else None,
        updated_at=report.updated_at,
    )
