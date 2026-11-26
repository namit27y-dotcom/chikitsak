from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.core.exceptions import AppError
from app.db.session import get_db
from app.models.care_plan import CarePlan
from app.models.user import User
from app.schemas.care_plan import (
    CarePlanResponse,
    GeminiFollowUpSchema,
    MedicationItemResponse,
)

router = APIRouter(prefix="/care-plans", tags=["Care Plans"])


def serialize_care_plan(plan: CarePlan) -> CarePlanResponse:
    follow_up_raw = plan.follow_up_json or {}
    return CarePlanResponse(
        id=plan.id,
        discharge_report_id=plan.discharge_report_id,
        title=plan.title,
        output_language=plan.output_language,
        patient_summary=plan.patient_summary,
        original_excerpt=plan.original_excerpt,
        diagnosis=list(plan.diagnosis_json or []),
        care_instructions=list(plan.care_instructions_json or []),
        warning_signs=list(plan.warning_signs_json or []),
        follow_up=GeminiFollowUpSchema(
            date=follow_up_raw.get("date"),
            instructions=follow_up_raw.get("instructions") or "",
        ),
        unclear_information=list(plan.unclear_information_json or []),
        validation_status=plan.validation_status,
        validation_notes=list(plan.validation_notes_json or []),
        medications=[
            MedicationItemResponse.model_validate(m) for m in (plan.medications or [])
        ],
        created_at=plan.created_at,
        updated_at=plan.updated_at,
    )


@router.get("", response_model=list[CarePlanResponse])
def list_care_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CarePlanResponse]:
    plans = db.scalars(
        select(CarePlan)
        .options(selectinload(CarePlan.medications))
        .where(CarePlan.user_id == current_user.id)
        .order_by(CarePlan.created_at.desc(), CarePlan.id.desc())
    ).all()
    return [serialize_care_plan(p) for p in plans]


@router.get("/{care_plan_id}", response_model=CarePlanResponse)
def get_care_plan(
    care_plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CarePlanResponse:
    plan = db.scalar(
        select(CarePlan)
        .options(selectinload(CarePlan.medications))
        .where(CarePlan.id == care_plan_id, CarePlan.user_id == current_user.id)
    )
    if plan is None:
        raise AppError("Care plan not found.", status_code=404, code="care_plan_not_found")
    return serialize_care_plan(plan)


@router.delete("/{care_plan_id}")
def delete_care_plan(
    care_plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str | int]:
    plan = db.scalar(
        select(CarePlan).where(
            CarePlan.id == care_plan_id, CarePlan.user_id == current_user.id
        )
    )
    if plan is None:
        raise AppError("Care plan not found.", status_code=404, code="care_plan_not_found")
    db.delete(plan)
    db.commit()
    return {"detail": "Care plan deleted successfully.", "id": care_plan_id}
