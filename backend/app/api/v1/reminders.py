from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.exceptions import AppError
from app.db.session import get_db
from app.models.care_plan import CarePlan
from app.models.reminder import Reminder
from app.models.user import User
from app.schemas.reminder import (
    ReminderCreateRequest,
    ReminderResponse,
    ReminderUpdateRequest,
)

router = APIRouter(prefix="/reminders", tags=["Reminders"])


@router.get("", response_model=list[ReminderResponse])
def list_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ReminderResponse]:
    items = db.scalars(
        select(Reminder)
        .where(Reminder.user_id == current_user.id)
        .order_by(Reminder.created_at.desc(), Reminder.id.desc())
    ).all()
    return [ReminderResponse.model_validate(r) for r in items]


@router.post("", response_model=ReminderResponse, status_code=201)
def create_reminder(
    payload: ReminderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReminderResponse:
    if payload.care_plan_id is not None:
        plan = db.scalar(
            select(CarePlan).where(
                CarePlan.id == payload.care_plan_id,
                CarePlan.user_id == current_user.id,
            )
        )
        if plan is None:
            raise AppError(
                "Referenced care plan was not found.",
                status_code=404,
                code="care_plan_not_found",
            )

    reminder = Reminder(
        user_id=current_user.id,
        care_plan_id=payload.care_plan_id,
        title=payload.title.strip(),
        reminder_time=payload.reminder_time.strip(),
        frequency=payload.frequency,
        category=payload.category,
        notes=payload.notes,
        is_active=True,
        is_completed=False,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return ReminderResponse.model_validate(reminder)


@router.patch("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: int,
    payload: ReminderUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReminderResponse:
    reminder = db.scalar(
        select(Reminder).where(
            Reminder.id == reminder_id,
            Reminder.user_id == current_user.id,
        )
    )
    if reminder is None:
        raise AppError("Reminder not found.", status_code=404, code="reminder_not_found")

    if payload.title is not None:
        reminder.title = payload.title.strip()
    if payload.reminder_time is not None:
        reminder.reminder_time = payload.reminder_time.strip()
    if payload.frequency is not None:
        reminder.frequency = payload.frequency
    if payload.category is not None:
        reminder.category = payload.category
    if payload.notes is not None:
        reminder.notes = payload.notes
    if payload.is_active is not None:
        reminder.is_active = payload.is_active
    if payload.is_completed is not None:
        reminder.is_completed = payload.is_completed

    db.commit()
    db.refresh(reminder)
    return ReminderResponse.model_validate(reminder)


@router.delete("/{reminder_id}")
def delete_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str | int]:
    reminder = db.scalar(
        select(Reminder).where(
            Reminder.id == reminder_id,
            Reminder.user_id == current_user.id,
        )
    )
    if reminder is None:
        raise AppError("Reminder not found.", status_code=404, code="reminder_not_found")

    db.delete(reminder)
    db.commit()
    return {"detail": "Reminder deleted successfully.", "id": reminder_id}
