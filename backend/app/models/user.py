from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.base import MongoBase


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(str, Enum):
    admin = "admin"
    client = "client"
    worker = "worker"


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


# --- worker ---


class WorkerPosition(BaseModel):
    position: str
    date: datetime


class WorkerInfo(BaseModel):
    date_of_birth: Optional[datetime] = None
    date_of_employment: Optional[datetime] = None
    date_of_remove: Optional[datetime] = None
    start_experience: Optional[int] = 0
    comment: Optional[str] = None
    work_day_start: Optional[str] = None
    work_day_end: Optional[str] = None


class WorkerInDB(MongoBase):
    username: str
    email: str
    phone: Optional[str] = None
    role: UserRole = UserRole.worker
    hashed_password: str
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: Optional[datetime] = Field(default_factory=utc_now)
    worker_info: Optional[WorkerInfo] = None
    worker_positions: Optional[List[WorkerPosition]] = None


class WorkerCreate(BaseModel):
    name: str
    email: str
    date_of_birth: datetime
    position: str
    start_experience: int
    work_day_start: str
    work_day_end: str


class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    position: Optional[str] = None
    work_day_start: Optional[str] = None
    work_day_end: Optional[str] = None
    comment: Optional[str] = None


class WorkerPublic(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    positions: List[str] = []
    current_position: Optional[str] = None
    experience_years: int
    work_day_start: Optional[str] = None
    work_day_end: Optional[str] = None
    comment: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    date_of_employment: Optional[datetime] = None
    date_of_remove: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


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
