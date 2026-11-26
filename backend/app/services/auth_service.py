from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.patient import Patient
from app.models.user import User
from app.schemas.auth import (
    UserLoginRequest,
    UserProfileUpdateRequest,
    UserRegisterRequest,
)


def register_user(db: Session, payload: UserRegisterRequest) -> tuple[User, str]:
    normalized_email = payload.email.strip().lower()
    existing = db.scalar(select(User).where(User.email == normalized_email))
    if existing:
        raise AppError(
            "An account with this email already exists.",
            status_code=409,
            code="email_already_registered",
        )

    user = User(
        email=normalized_email,
        full_name=payload.full_name.strip(),
        hashed_password=hash_password(payload.password),
        preferred_language=payload.preferred_language,
        is_active=True,
    )
    db.add(user)
    db.flush()

    patient = Patient(
        user_id=user.id,
        full_name=payload.full_name.strip(),
        age=payload.age,
        blood_group=payload.blood_group,
        phone=payload.phone,
        emergency_contact=payload.emergency_contact,
        preferred_language=payload.preferred_language,
    )
    db.add(patient)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id), {"email": user.email})
    return user, token


def authenticate_user(db: Session, payload: UserLoginRequest) -> tuple[User, str]:
    normalized_email = payload.email.strip().lower()
    user = db.scalar(select(User).where(User.email == normalized_email))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise AppError(
            "Invalid email or password.",
            status_code=401,
            code="invalid_credentials",
        )
    if not user.is_active:
        raise AppError(
            "This user account is inactive.",
            status_code=403,
            code="inactive_user",
        )

    token = create_access_token(str(user.id), {"email": user.email})
    return user, token


def update_user_profile(
    db: Session, user: User, payload: UserProfileUpdateRequest
) -> User:
    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.preferred_language is not None:
        user.preferred_language = payload.preferred_language

    patient = user.primary_patient
    if patient is None:
        patient = Patient(
            user_id=user.id,
            full_name=user.full_name,
            preferred_language=user.preferred_language,
        )
        db.add(patient)

    if payload.full_name is not None:
        patient.full_name = payload.full_name.strip()
    if payload.preferred_language is not None:
        patient.preferred_language = payload.preferred_language
    if payload.age is not None:
        patient.age = payload.age
    if payload.blood_group is not None:
        patient.blood_group = payload.blood_group.strip()
    if payload.phone is not None:
        patient.phone = payload.phone.strip()
    if payload.emergency_contact is not None:
        patient.emergency_contact = payload.emergency_contact.strip()

    db.commit()
    db.refresh(user)
    return user
