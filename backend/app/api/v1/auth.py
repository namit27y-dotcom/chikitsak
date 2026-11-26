from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    PatientProfileResponse,
    TokenResponse,
    UserLoginRequest,
    UserProfileUpdateRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import (
    authenticate_user,
    register_user,
    update_user_profile,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def serialize_user(user: User) -> UserResponse:
    patient = user.primary_patient
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        is_active=user.is_active,
        created_at=user.created_at,
        patient=(
            PatientProfileResponse.model_validate(patient)
            if patient is not None
            else None
        ),
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user, token = register_user(db, payload)
    return TokenResponse(access_token=token, user=serialize_user(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user, token = authenticate_user(db, payload)
    return TokenResponse(access_token=token, user=serialize_user(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return serialize_user(current_user)


@router.patch("/me", response_model=UserResponse)
def patch_me(
    payload: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    updated = update_user_profile(db, current_user, payload)
    return serialize_user(updated)
