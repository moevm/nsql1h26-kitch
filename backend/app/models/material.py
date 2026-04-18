from pydantic import BaseModel, Field
from typing import Optional
from .base import MongoBase
from datetime import datetime, timezone


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Material(BaseModel):
    name: str
    remain: int
    cost: int


class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    remain: Optional[int] = None
    cost: Optional[int] = None


class MaterialInDB(MongoBase):
    name: str
    remain: int
    cost: int
    updated_at: datetime = Field(default_factory=utc_now)
