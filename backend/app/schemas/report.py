from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DischargeReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_filename: str
    mime_type: str
    file_size_bytes: int
    output_language: str
    processing_status: str
    extraction_method: Optional[str] = None
    error_message: Optional[str] = None
    care_plan_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class ReportStatusResponse(BaseModel):
    report_id: int
    processing_status: str
    extraction_method: Optional[str] = None
    error_message: Optional[str] = None
    care_plan_id: Optional[int] = None
    validation_status: Optional[str] = None
    updated_at: datetime
