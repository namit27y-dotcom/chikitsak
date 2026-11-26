from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.api.v1.care_plans import serialize_care_plan
from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.care_plan import CarePlan
from app.models.medication import Medication
from app.models.reminder import Reminder
from app.models.user import User
from app.schemas.appointment import AppointmentResponse
from app.schemas.dashboard import DashboardOverviewResponse, DashboardStats
from app.schemas.medication import MedicationResponse
from app.schemas.reminder import ReminderResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardOverviewResponse:
    plans = db.scalars(
        select(CarePlan)
        .options(selectinload(CarePlan.medications))
        .where(CarePlan.user_id == current_user.id)
        .order_by(CarePlan.created_at.desc(), CarePlan.id.desc())
    ).all()

    medications = db.scalars(
        select(Medication)
        .where(Medication.user_id == current_user.id)
        .order_by(Medication.id.asc())
    ).all()

    reminders = db.scalars(
        select(Reminder)
        .where(Reminder.user_id == current_user.id)
        .order_by(Reminder.created_at.desc(), Reminder.id.desc())
    ).all()

    appointments = db.scalars(
        select(Appointment)
        .where(Appointment.user_id == current_user.id)
        .order_by(Appointment.created_at.desc(), Appointment.id.desc())
    ).all()

    recent_plan = plans[0] if plans else None
    recent_meds = recent_plan.medications if recent_plan else []
    total_meds = len(recent_meds)
    taken_meds = sum(1 for m in recent_meds if m.taken_today)
    adherence = round((taken_meds / total_meds) * 100) if total_meds > 0 else 0

    active_reminders = sum(1 for r in reminders if r.is_active and not r.is_completed)
    kept_apts = sum(1 for a in appointments if a.status == "Kept")

    upcoming_apt = next((a for a in appointments if a.status == "Upcoming"), None)
    next_follow_up = (
        upcoming_apt.appointment_date
        if upcoming_apt is not None
        else (recent_plan.follow_up_json or {}).get("date")
        if recent_plan is not None
        else None
    )

    serialized_plans = [serialize_care_plan(p) for p in plans]

    return DashboardOverviewResponse(
        stats=DashboardStats(
            total_care_plans=len(plans),
            total_medications=total_meds,
            taken_medications_today=taken_meds,
            adherence_percent=adherence,
            active_reminders_count=active_reminders,
            appointments_kept_count=kept_apts,
            total_appointments_count=len(appointments),
            next_follow_up=next_follow_up,
        ),
        recent_care_plan=serialized_plans[0] if serialized_plans else None,
        care_plans=serialized_plans,
        medications=[MedicationResponse.model_validate(m) for m in medications],
        reminders=[ReminderResponse.model_validate(r) for r in reminders],
        appointments=[AppointmentResponse.model_validate(a) for a in appointments],
    )
