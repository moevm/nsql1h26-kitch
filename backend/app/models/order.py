from pydantic import BaseModel, Field
from typing import List, Optional
from .base import MongoBase
from datetime import datetime, timezone
from enum import Enum
from app.models.design import TypeDesign


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Client(BaseModel):
    client_id: str
    username: str
    phone: str


class Delivery(BaseModel):
    address: str
    floor: int
    has_lift: bool


class Pricing(BaseModel):
    total_price: int
    type_price: int
    material_price: int
    delivery_price: int
    comment_price: int


class Times(BaseModel):
    deadline: Optional[datetime] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    est_time: int
    spent: int
    expired_time: int


class TypeStatus(str, Enum):
    Processing = "В обработке"
    Accept = "Принят"
    Cutting = "Раскрой"
    Production = "Производство"
    Delivery = "Доставка"
    Montage = "Монтаж"
    Completed = "Завершён"
    Canceled = "Отменён"


class Stages(BaseModel):
    name: str
    worker_id: str
    status: TypeStatus
    times: Times


class Sizes(BaseModel):
    height: int
    width: int
    length: int


class Color(BaseModel):
    red: int
    green: int
    blue: int
    name: str


class Order(BaseModel):
    material_id: str
    design_id: str
    client: Client
    item: str
    delivery: Delivery
    pricing: Pricing
    stages: List[Stages]
    comment: str
    name_design: str
    type: TypeDesign
    material: str
    size: Sizes
    color: Color
    need_material: int
    blueprint: int


class OrderInDB(MongoBase):
    material_id: str
    design_id: str
    client: Client
    item: str
    delivery: Delivery
    pricing: Pricing
    stages: List[Stages]
    comment: str
    name_design: str
    type: TypeDesign
    material: str
    size: Sizes
    color: Color
    need_material: int
    blueprint: Optional[int] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class OrderUpdate(BaseModel):
    material_id: Optional[str] = None
    design_id: Optional[str] = None
    client: Optional[Client] = None
    item: Optional[str] = None
    delivery: Optional[Delivery] = None
    pricing: Optional[Pricing] = None
    stages: Optional[List[Stages]] = None
    comment: Optional[str] = None
    name_design: Optional[str] = None
    type: Optional[TypeDesign] = None
    material: Optional[str] = None
    size: Optional[Sizes] = None
    color: Optional[Color] = None
    need_material: Optional[int] = None
    blueprint: Optional[int] = None


class OrderCreate(BaseModel):
    phone: str
    address: str
    kitchen_type: TypeDesign
    design_id: str
    color: Color
    material: str
    floor: int
    has_lift: bool
    comment: Optional[str] = None
    type_price: int
    material_price: int
    delivery_price: int
    comment_price: int
