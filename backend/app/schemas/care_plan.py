from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class GeminiMedicationSchema(BaseModel):
    medicine_name: str = Field(default="")
    dosage: str = Field(default="")
    frequency: str = Field(default="")
    duration: str = Field(default="")
    administration_time: str = Field(default="")
    additional_instructions: str = Field(default="")


class GeminiFollowUpSchema(BaseModel):
    date: Optional[str] = None
    instructions: str = Field(default="")


class GeminiCarePlanPayload(BaseModel):
    patient_summary: str = Field(min_length=1)
    diagnosis: List[str] = Field(default_factory=list)
    medications: List[GeminiMedicationSchema] = Field(default_factory=list)
    care_instructions: List[str] = Field(default_factory=list)
    warning_signs: List[str] = Field(default_factory=list)
    follow_up: GeminiFollowUpSchema = Field(default_factory=GeminiFollowUpSchema)
    unclear_information: List[str] = Field(default_factory=list)
    output_language: Literal["English", "Hindi"] = "English"


class MedicationItemResponse(BaseModel):
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


class CarePlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    discharge_report_id: Optional[int] = None
    title: str
    output_language: str
    patient_summary: str
    original_excerpt: Optional[str] = None
    diagnosis: List[str]
    care_instructions: List[str]
    warning_signs: List[str]
    follow_up: GeminiFollowUpSchema
    unclear_information: List[str]
    validation_status: str
    validation_notes: List[str]
    medications: List[MedicationItemResponse]
    created_at: datetime
    updated_at: datetime
