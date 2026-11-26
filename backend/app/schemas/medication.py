from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MedicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    care_plan_id: int
    medicine_name: str
    dosage: str
    frequency: str
    duration: str
    administration_time: str
    additional_instructions: Optional[str] = None
    verified_against_source: bool
    validation_note: Optional[str] = None
    taken_today: bool
    created_at: datetime
    updated_at: datetime


class MedicationCreateRequest(BaseModel):
    care_plan_id: int
    medicine_name: str
    dosage: str = ""
    frequency: str = ""
    duration: str = ""
    administration_time: str = ""
    additional_instructions: Optional[str] = None


class MedicationUpdateRequest(BaseModel):
    taken_today: bool

