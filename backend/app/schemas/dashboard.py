from typing import List, Optional
from pydantic import BaseModel

from app.schemas.appointment import AppointmentResponse
from app.schemas.care_plan import CarePlanResponse
from app.schemas.medication import MedicationResponse
from app.schemas.reminder import ReminderResponse


class DashboardStats(BaseModel):
    total_care_plans: int
    total_medications: int
    taken_medications_today: int
    adherence_percent: int
    active_reminders_count: int
    appointments_kept_count: int
    total_appointments_count: int
    next_follow_up: Optional[str] = None


class DashboardOverviewResponse(BaseModel):
    stats: DashboardStats
    recent_care_plan: Optional[CarePlanResponse] = None
    care_plans: List[CarePlanResponse]
    medications: List[MedicationResponse]
    reminders: List[ReminderResponse]
    appointments: List[AppointmentResponse]
