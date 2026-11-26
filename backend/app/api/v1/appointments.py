from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.exceptions import AppError
from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.care_plan import CarePlan
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreateRequest,
    AppointmentResponse,
    AppointmentUpdateRequest,
)

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("", response_model=list[AppointmentResponse])
def list_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AppointmentResponse]:
    items = db.scalars(
        select(Appointment)
        .where(Appointment.user_id == current_user.id)
        .order_by(Appointment.created_at.desc(), Appointment.id.desc())
    ).all()
    return [AppointmentResponse.model_validate(a) for a in items]


@router.post("", response_model=AppointmentResponse, status_code=201)
def create_appointment(
    payload: AppointmentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AppointmentResponse:
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

    appointment = Appointment(
        user_id=current_user.id,
        care_plan_id=payload.care_plan_id,
        doctor_name=payload.doctor_name.strip(),
        hospital_name=payload.hospital_name.strip(),
        appointment_date=payload.appointment_date.strip(),
        appointment_notes=payload.appointment_notes,
        status=payload.status,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return AppointmentResponse.model_validate(appointment)


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AppointmentResponse:
    appointment = db.scalar(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.user_id == current_user.id,
        )
    )
    if appointment is None:
        raise AppError(
            "Appointment not found.", status_code=404, code="appointment_not_found"
        )

    if payload.doctor_name is not None:
        appointment.doctor_name = payload.doctor_name.strip()
    if payload.hospital_name is not None:
        appointment.hospital_name = payload.hospital_name.strip()
    if payload.appointment_date is not None:
        appointment.appointment_date = payload.appointment_date.strip()
    if payload.appointment_notes is not None:
        appointment.appointment_notes = payload.appointment_notes
    if payload.status is not None:
        appointment.status = payload.status

    db.commit()
    db.refresh(appointment)
    return AppointmentResponse.model_validate(appointment)


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str | int]:
    appointment = db.scalar(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.user_id == current_user.id,
        )
    )
    if appointment is None:
        raise AppError(
            "Appointment not found.", status_code=404, code="appointment_not_found"
        )

    db.delete(appointment)
    db.commit()
    return {"detail": "Appointment deleted successfully.", "id": appointment_id}
