from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.service.auth_service import get_current_user_dep
from app.service.order_service import (
    get_order_by_id,
    create_new_order,
    cancel_order,
    get_orders_by_user_role,
    get_filtered_orders_for_client,
    next_stage,
    can_worker_view_order,
)
from app.models.order import OrderCreate, Order, TypeStage
from app.models.design import TypeDesign
from datetime import datetime

ALLOWED_SORTED_FIELDS = {
    "created_at",
    "name_design",
    "type",
    "material",
    "stage",
    "deadline",
    "total_price",
}

router = APIRouter(prefix="/api", tags=["orders"])


@router.get(
    "/orders/filter",
    response_model=dict,
    summary="Получить отфильтрованные заказы покупателю",
    description="Возвращает отфильтрованные заказы для клиента с регистронезависимым поиском и общее количество без пагинации",
)
async def get_filtered_orders_client(
    name_design: str = None,
    type: TypeDesign = None,
    material: str = None,
    stage: TypeStage = None,
    address: str = None,
    comment: str = None,
    min_price: int = None,
    max_price: int = None,
    from_created: Optional[datetime] = None,
    to_created: Optional[datetime] = None,
    from_deadline: Optional[datetime] = None,
    to_deadline: Optional[datetime] = None,
    sort_by: str = "created_at",
    sort: str = "ASC",
    start: int = 0,
    limit: int = -1,
    current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Только клиенты могут фильтровать свои заказы")
    if sort_by not in ALLOWED_SORTED_FIELDS:
        raise HTTPException(status_code=400, detail=f"Не может быть отсортировано по {sort_by}. Используйте что-то из списка {ALLOWED_SORTED_FIELDS}")
    if sort.upper() not in {"ASC", "DESC"}:
        raise HTTPException(status_code=400, detail="sort может быть только 'ASC' или 'DESC'")
    sort_direction = 1 if sort.upper() == "ASC" else -1
    if limit < -1:
        limit = 1
    elif limit == 0:
        raise HTTPException(status_code=400, detail="limit должен быть больше 0")
    items, total = await get_filtered_orders_for_client(
        client_id=current_user["user_id"],
        name_design=name_design,
        type=type,
        material=material,
        stage=stage,
        address=address,
        comment=comment,
        min_price=min_price,
        max_price=max_price,
        from_created=from_created,
        to_created=to_created,
        from_deadline=from_deadline,
        to_deadline=to_deadline,
        sort_by=sort_by,
        sort_direction=sort_direction,
        skip=start,
        limit=limit
    )
    return {"items": items, "total": total}


@router.get(
    "/orders",
    response_model=List[Order],
    summary="Получить список заказов",
)
async def get_orders(current_user: dict = Depends(get_current_user_dep)):
    orders = await get_orders_by_user_role(user_id=current_user["user_id"], role=current_user["role"])
    return orders


@router.get(
    "/orders/{order_id}",
    response_model=Order,
    summary="Получить заказ по ID",
)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user_dep)):
    order = await get_order_by_id(order_id)
    if current_user["role"] == "admin":
        return order
    if current_user["role"] == "client":
        if order.client.client_id != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Доступ запрещен: это не ваш заказ")
        return order
    if current_user["role"] == "worker":
        is_participating = await can_worker_view_order(order, current_user["user_id"])
        if not is_participating:
            raise HTTPException(status_code=403, detail="Доступ запрещен: вы не участвуете в этом заказе")
        return order
    raise HTTPException(status_code=403, detail="Недостаточно прав")


@router.post(
    "/orders/new",
    status_code=201,
    response_model=dict,
    summary="Создать новый заказ",
)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user_dep)):
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Только клиенты могут создавать заказы")
    order_id = await create_new_order(order_data, current_user["user_id"], current_user["username"], current_user["role"])
    return {"id": order_id, "message": "Заказ успешно создан"}


@router.patch(
    "/orders/{order_id}/cancel",
    status_code=200,
    response_model=dict,
    summary="Отменить заказ",
)
async def cancel_order_endpoint(order_id: str, current_user: dict = Depends(get_current_user_dep)):
    if current_user["role"] == "worker":
        raise HTTPException(status_code=403, detail="Рабочие не могут отменять заказы")
    result = await cancel_order(order_id=order_id, user_id=current_user["user_id"], role=current_user["role"])
    return result


@router.post(
    "/next_stage/{order_id}",
    status_code=200,
    response_model=dict,
    summary="Перевести заказ на следующий этап",
)
async def next_stage_endpoint(order_id: str, current_user: dict = Depends(get_current_user_dep)):
    return await next_stage(order_id, current_user["role"])
