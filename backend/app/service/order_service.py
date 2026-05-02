from fastapi import HTTPException, status
from app.models.order import (
    Order,
    OrderInDB,
    OrderCreate,
    Client,
    Delivery,
    Pricing,
    TypeStage,
    TypeTask
)
from app.data import order_repository as order_repo
from app.data import design_data as design_repo
from typing import List, Optional
from app.models.design import TypeDesign
from app.models.order import TypeTask
from datetime import datetime, timedelta



STAGE_SEQUENCE = [
    TypeStage.Cutting,
    TypeStage.Production,
    TypeStage.Delivery,
    TypeStage.Montage,
    TypeStage.Completed,
]

async def next_stage(order_id: str, role: str) -> dict:
    if role not in ("admin", "worker"):
        raise HTTPException(status_code=403, detail="Доступ только для worker и admin")

    order_db = await order_repo.get_by_id(order_id)
    if not order_db:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    if not order_db.stages:
        raise HTTPException(status_code=400, detail="У заказа нет этапов")

    last_stage = order_db.stages[-1]

    if last_stage.task_status not in (TypeTask.Completed, TypeTask.Overdue):
        raise HTTPException(
            status_code=400,
            detail="Текущий этап ещё не завершён"
        )

    if last_stage.name_stage in (TypeStage.Completed, TypeStage.Canceled):
        raise HTTPException(
            status_code=400,
            detail="Заказ уже завершён или отменён"
        )

    from app.models.order import Stages, TypeStatus, Times
    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)

    try:
        current_index = STAGE_SEQUENCE.index(last_stage.name_stage)
        next_stage_type = STAGE_SEQUENCE[current_index + 1]
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Следующий этап не найден")

    if next_stage_type == TypeStage.Completed:
        new_stage = Stages(
            name_stage=TypeStage.Completed,
            worker_id="",
            status=TypeStatus.Completed,
            task_status=TypeTask.Completed,
            times=Times(
                deadline=now,
                start=now,
                end=now,
                est_time=0,
                spent=0,
                expired_time=0,
            )
        )
    else:
        new_stage = Stages(
            name_stage=next_stage_type,
            worker_id="",
            status=TypeStatus.In_progress,
            task_status=TypeTask.Available,
            times=Times(
                deadline=now + timedelta(minutes=2880),
                start=now,
                end=None,
                est_time=2880,
                spent=0,
                expired_time=0,
            )
        )

    success = await order_repo.push_stage(order_id, new_stage.model_dump())
    if not success:
        raise HTTPException(status_code=500, detail="Не удалось добавить этап")

    return {
        "order_id": order_id,
        "next_stage": next_stage_type.value,
        "message": "Этап успешно добавлен"
    }


async def get_order_by_id(order_id: str) -> Order:
    order_db = await order_repo.get_by_id(order_id)
    if order_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Заказ с ID {order_id} не найден",
        )
    order_dict = order_db.model_dump()
    order_dict["id"] = str(order_db.id)
    return Order(**order_dict)


async def get_orders_by_user_role(user_id: str, role: str) -> List[Order]:
    if role == "admin":
        orders_db = await order_repo.get_all()
    elif role == "client":
        orders_db = await order_repo.get_by_client_id(user_id)
    elif role == "worker":
        orders_db = await order_repo.get_by_worker_id(user_id)
    else:
        raise HTTPException(status_code=403, detail="Неизвестная роль")

    orders = []
    for order_db in orders_db:
        order_dict = order_db.model_dump()
        order_dict["id"] = str(order_db.id)
        orders.append(Order(**order_dict))
    return orders


async def create_new_order(
    order_data: OrderCreate, user_id: str, username: str, role: str
) -> str:
    if role != "client":
        raise HTTPException(
            status_code=403, detail="Только клиенты могут создавать заказы"
        )
    design = await design_repo.get_by_id(order_data.design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Дизайн не найден")

    from app.data import material_data as material_repo

    material = await material_repo.get_by_name(order_data.material)
    if not material:
        raise HTTPException(status_code=404, detail="Материал не найден")

    total_price = (
        order_data.type_price
        + order_data.material_price
        + order_data.delivery_price
        + order_data.comment_price
    )
    from app.models.order import Stages, TypeStatus, TypeTask, Times
    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)

    first_stage = Stages(
        name_stage=TypeStage.Cutting,
        worker_id="",
        status=TypeStatus.In_progress,
        task_status=TypeTask.Available,
        times=Times(
            deadline=now + timedelta(minutes=2880),
            start=now,
            end=None,
            est_time=2880,
            spent=0,
            expired_time=0,
        )
    )

    order_dict = {
        "material_id": str(material.id),
        "design_id": order_data.design_id,
        "client": Client(client_id=user_id, username=username, phone=order_data.phone),
        "item": order_data.kitchen_type,
        "delivery": Delivery(
            address=order_data.address,
            floor=order_data.floor,
            has_lift=order_data.has_lift,
        ),
        "pricing": Pricing(
            total_price=total_price,
            type_price=order_data.type_price,
            material_price=order_data.material_price,
            delivery_price=order_data.delivery_price,
            comment_price=order_data.comment_price,
        ),
        "stages": [first_stage.model_dump()],
        "comment": order_data.comment or "",
        "name_design": design.name,
        "type": design.type,
        "material": material.name,
        "size": (
            design.size.model_dump()
            if hasattr(design.size, "model_dump")
            else dict(design.size)
        ),
        "color": order_data.color,
        "need_material": design.need_material,
        "blueprint": design.blueprint or 0,
    }

    order_in_db = OrderInDB(**order_dict)
    return await order_repo.create(order_in_db)


async def cancel_order(order_id: str, user_id: str, role: str) -> dict:
    if role == "worker":
        raise HTTPException(status_code=403, detail="Рабочий не может отменять заказы")

    order = await get_order_by_id(order_id)

    if role == "client":
        if order.client.client_id != user_id:
            raise HTTPException(
                status_code=403, detail="Вы можете отменить только свои заказы"
            )

    success = await order_repo.cancel(order_id)
    if not success:
        raise HTTPException(status_code=500, detail="Не удалось отменить заказ")

    return {"order_id": order_id, "message": "Заказ успешно отменён"}


async def can_worker_view_order(order: Order, worker_id: str) -> bool:
    if any(stage.worker_id == worker_id for stage in order.stages):
        return True
    if any(not stage.worker_id and stage.task_status == TypeTask.Available for stage in order.stages):
        return True
    return False


async def get_filtered_orders_for_client(
    client_id: str,
    name_design: str,
    type: TypeDesign,
    material: str,
    stage: TypeStage,
    address: str,
    comment: str,
    min_price: int,
    max_price: int,
    from_created: Optional[datetime],
    to_created: Optional[datetime],
    from_deadline: Optional[datetime],
    to_deadline: Optional[datetime],
    sort_by: str,
    sort_direction: int,
    skip: int,
    limit: int,
) -> List[Order]:
    
    def normalize_by_time_zone(dt: Optional[datetime]) -> Optional[datetime]:
        if dt is None:
            return None
        return dt + timedelta(hours=3)

    from_created = normalize_by_time_zone(from_created)
    to_created = normalize_by_time_zone(to_created)
    from_deadline = normalize_by_time_zone(from_deadline)
    to_deadline = normalize_by_time_zone(to_deadline)
    
    orders_db = await order_repo.get_filtered_orders_for_client(
        client_id,
        name_design,
        type,
        material,
        stage,
        address,
        comment,
        min_price,
        max_price,
        from_created,
        to_created,
        from_deadline,
        to_deadline,
        sort_by,
        sort_direction,
        skip,
        limit,
    )
    return [Order(**order.model_dump()) for order in orders_db]
