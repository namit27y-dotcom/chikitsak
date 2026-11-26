from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class AppointmentCreateRequest(BaseModel):
    doctor_name: str = Field(min_length=1, max_length=160)
    hospital_name: str = Field(min_length=1, max_length=200)
    appointment_date: str = Field(min_length=1, max_length=64)
    appointment_notes: Optional[str] = None
    status: Literal["Upcoming", "Kept", "Rescheduled", "Cancelled"] = "Upcoming"
    care_plan_id: Optional[int] = None


class AppointmentUpdateRequest(BaseModel):
    doctor_name: Optional[str] = Field(default=None, min_length=1, max_length=160)
    hospital_name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    appointment_date: Optional[str] = Field(default=None, min_length=1, max_length=64)
    appointment_notes: Optional[str] = None
    status: Optional[Literal["Upcoming", "Kept", "Rescheduled", "Cancelled"]] = None


class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    care_plan_id: Optional[int] = None
    doctor_name: str
    hospital_name: str
    appointment_date: str
    appointment_notes: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
