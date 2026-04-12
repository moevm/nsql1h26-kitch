from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(str, Enum):
    admin = "admin"
    client = "client"
    worker = "worker"

# --- worker ---

class WorkerPosition(BaseModel):
    position: str
    date: datetime


class WorkerInfo(BaseModel):
    date_of_birth: Optional[datetime] = None
    date_of_employment: Optional[datetime] = None
    comment: Optional[str] = None
    work_day_start: Optional[datetime] = None
    work_day_end: Optional[datetime] = None

# ---Base---

class UserBase(BaseModel):
    username: str
    email: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserAuth(BaseModel):
    email: str
    password: str


class UserInDB(UserBase):
    role: UserRole = UserRole.client
    hashed_password: str
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: Optional[datetime] = Field(default_factory=utc_now)
    worker_info: Optional[WorkerInfo] = None
    worker_positions: Optional[list[WorkerPosition]] = None

# --- Responce ---

class UserPublic(UserBase):
    id: str
    role: UserRole


class RegisterResponse(BaseModel):
    id: str


class AuthResponse(BaseModel):
    token: str
