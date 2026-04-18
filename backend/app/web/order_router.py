from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.service.auth_service import get_current_user_dep
from app.service.order_service import (
    get_order_by_id,
    create_new_order,
    cancel_order,
    get_orders_by_user_role
)
from app.models.order import OrderCreate, Order

router = APIRouter(prefix="/api", tags=["orders"])


@router.get(
    "/orders",
    response_model=List[Order],
    summary="Получить список заказов",
    description="""
    Возвращает все заказы текущего пользователя в зависимости от роли:
    - **CLIENT**: только свои заказы
    - **WORKER**: заказы, где рабочий участвует
    - **ADMIN**: все заказы
    """
)
async def get_orders(current_user: dict = Depends(get_current_user_dep)):
    orders = await get_orders_by_user_role(
        user_id=current_user["user_id"],
        role=current_user["role"]
    )
    return orders


@router.get(
    "/orders/{order_id}",
    response_model=Order,
    summary="Получить заказ по ID",
    description="""
    Возвращает заказ по ID с проверкой прав:
    - **CLIENT**: только свой заказ
    - **WORKER**: если участвует в заказе
    - **ADMIN**: любой заказ
    """
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
        is_participating = any(stage.worker_id == current_user["user_id"] for stage in order.stages)
        if not is_participating:
            raise HTTPException(status_code=403, detail="Доступ запрещен: вы не участвуете в этом заказе")
        return order

    raise HTTPException(status_code=403, detail="Недостаточно прав")


@router.post(
    "/orders/new",
    status_code=201,
    response_model=dict,
    summary="Создать новый заказ",
    description="Создает новый заказ. Доступно только для клиентов."
)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Только клиенты могут создавать заказы")

    order_id = await create_new_order(
        order_data,
        current_user["user_id"],
        current_user["username"],
        current_user["role"]
    )

    return {"id": order_id, "message": "Заказ успешно создан"}


@router.patch(
    "/orders/{order_id}/cancel",
    status_code=200,
    response_model=dict,
    summary="Отменить заказ",
    description="""
    Отмена заказа через PATCH.
    - **CLIENT**: может отменить только свой заказ
    - **ADMIN**: может отменить любой заказ
    - **WORKER**: не может отменять заказы
    """
)
async def cancel_order_endpoint(
    order_id: str,
    current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] == "worker":
        raise HTTPException(status_code=403, detail="Рабочие не могут отменять заказы")
    result = await cancel_order(
        order_id=order_id,
        user_id=current_user["user_id"],
        role=current_user["role"]
    )
    return result
