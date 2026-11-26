from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class ReminderCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    reminder_time: str = Field(min_length=1, max_length=64)
    frequency: Literal["Daily", "Once", "Weekly"] = "Daily"
    category: Literal["Medicine", "Appointment", "Checkup"] = "Medicine"
    notes: Optional[str] = None
    care_plan_id: Optional[int] = None


class ReminderUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    reminder_time: Optional[str] = Field(default=None, min_length=1, max_length=64)
    frequency: Optional[Literal["Daily", "Once", "Weekly"]] = None
    category: Optional[Literal["Medicine", "Appointment", "Checkup"]] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    is_completed: Optional[bool] = None


class ReminderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    care_plan_id: Optional[int] = None
    title: str
    reminder_time: str
    frequency: str
    category: str
    notes: Optional[str] = None
    is_active: bool
    is_completed: bool
    created_at: datetime
    updated_at: datetime
