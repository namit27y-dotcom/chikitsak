from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.exceptions import AppError
from app.db.session import get_db
from app.models.care_plan import CarePlan
from app.models.medication import Medication
from app.models.user import User
from app.schemas.medication import (
    MedicationCreateRequest,
    MedicationResponse,
    MedicationUpdateRequest,
)

router = APIRouter(prefix="/medications", tags=["Medications"])


@router.get("", response_model=list[MedicationResponse])
def list_medications(
    care_plan_id: int | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MedicationResponse]:
    stmt = select(Medication).where(Medication.user_id == current_user.id)
    if care_plan_id is not None:
        stmt = stmt.where(Medication.care_plan_id == care_plan_id)
    stmt = stmt.order_by(Medication.id.asc())
    meds = db.scalars(stmt).all()
    return [MedicationResponse.model_validate(m) for m in meds]


@router.post("", response_model=MedicationResponse, status_code=201)
def create_medication(
    payload: MedicationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MedicationResponse:
    plan = db.scalar(
        select(CarePlan).where(
            CarePlan.id == payload.care_plan_id,
            CarePlan.user_id == current_user.id,
        )
    )
    if plan is None:
        raise AppError("Care plan not found.", status_code=404, code="care_plan_not_found")

    med = Medication(
        user_id=current_user.id,
        care_plan_id=plan.id,
        medicine_name=payload.medicine_name.strip(),
        dosage=payload.dosage.strip(),
        frequency=payload.frequency.strip(),
        duration=payload.duration.strip(),
        administration_time=payload.administration_time.strip(),
        additional_instructions=payload.additional_instructions,
        verified_against_source=False,
        validation_note="Manually added by user",
        taken_today=False,
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return MedicationResponse.model_validate(med)


@router.get("/{medication_id}", response_model=MedicationResponse)
def get_medication(
    medication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MedicationResponse:
    med = db.scalar(
        select(Medication).where(
            Medication.id == medication_id,
            Medication.user_id == current_user.id,
        )
    )
    if med is None:
        raise AppError("Medication not found.", status_code=404, code="medication_not_found")
    return MedicationResponse.model_validate(med)


@router.patch("/{medication_id}", response_model=MedicationResponse)
def update_medication(
    medication_id: int,
    payload: MedicationUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MedicationResponse:
    med = db.scalar(
        select(Medication).where(
            Medication.id == medication_id,
            Medication.user_id == current_user.id,
        )
    )
    if med is None:
        raise AppError("Medication not found.", status_code=404, code="medication_not_found")

    med.taken_today = payload.taken_today
    db.commit()
    db.refresh(med)
    return MedicationResponse.model_validate(med)
