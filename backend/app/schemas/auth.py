from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=160)
    preferred_language: str = Field(default="bilingual", max_length=24)
    age: Optional[int] = Field(default=None, ge=0, le=130)
    blood_group: Optional[str] = Field(default=None, max_length=16)
    phone: Optional[str] = Field(default=None, max_length=32)
    emergency_contact: Optional[str] = Field(default=None, max_length=160)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class PatientProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    age: Optional[int] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    preferred_language: str


class UserProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=160)
    preferred_language: Optional[str] = Field(default=None, max_length=24)
    age: Optional[int] = Field(default=None, ge=0, le=130)
    blood_group: Optional[str] = Field(default=None, max_length=16)
    phone: Optional[str] = Field(default=None, max_length=32)
    emergency_contact: Optional[str] = Field(default=None, max_length=160)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    preferred_language: str
    is_active: bool
    created_at: datetime
    patient: Optional[PatientProfileResponse] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
