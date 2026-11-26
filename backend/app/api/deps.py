import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AppError(
            "Authentication credentials were not provided.",
            status_code=401,
            code="not_authenticated",
        )

    try:
        payload = decode_access_token(credentials.credentials)
        subject = payload.get("sub")
        user_id = int(subject)
    except (jwt.PyJWTError, TypeError, ValueError):
        raise AppError(
            "Invalid or expired authentication token.",
            status_code=401,
            code="invalid_token",
        )

    user = db.scalar(
        select(User)
        .options(selectinload(User.patients))
        .where(User.id == user_id)
    )
    if user is None:
        raise AppError(
            "User account not found.",
            status_code=401,
            code="user_not_found",
        )
    if not user.is_active:
        raise AppError(
            "User account is inactive.",
            status_code=403,
            code="inactive_user",
        )
    return user
