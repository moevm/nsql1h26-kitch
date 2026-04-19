from pydantic import BaseModel, Field
from typing import Optional
from .base import MongoBase, PyObjectId
from datetime import datetime, timezone
from enum import Enum


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Size_design(BaseModel):
    height: int
    width: int
    length: int


class Color_design(BaseModel):
    red: int
    green: int
    blue: int
    name: str


class TypeDesign(str, Enum):
    G_shaped = "G-образная"
    Island = "Островная"
    U_shaped = "П-образная"
    Two_linear = "Двухлинейная"
    Linear = "Линейная"
    L_shaped = "Г-образная"


class Design(BaseModel):
    id: str
    name: str
    type: TypeDesign
    size: Size_design
    material: str
    material_id: str
    design_price: int
    material_price: int
    color: Color_design
    description: str
    production_time: int
    need_material: int
    blueprint: int


class DesignUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    size: Optional[Size_design] = None
    material: Optional[str] = None
    material_id: Optional[str] = None
    design_price: Optional[int] = None
    material_price: Optional[int] = None
    color: Optional[Color_design] = None
    description: Optional[str] = None
    production_time: Optional[int] = None
    need_material: Optional[int] = None
    blueprint: Optional[int] = None


class DesignInDB(MongoBase):
    name: str
    type: str
    size: Size_design
    material: str
    material_id: PyObjectId
    design_price: int
    material_price: int
    color: Color_design
    description: str
    production_time: int
    need_material: int
    blueprint: Optional[int] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
