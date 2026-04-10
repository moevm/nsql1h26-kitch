from fastapi import APIRouter, Header, HTTPException
from app.service.auth_service import get_current_user
from app.service.order_service import (
    get_order_by_id,
    get_orders_ids_by_client,
    create_new_order,
    update_order,
    delete_order,
    get_all_orders
)
from app.models.order import OrderCreate, OrderUpdate

router = APIRouter(prefix="/api", tags=["orders"])


@router.get("/order/{order_id}")
async def get_order(
    order_id: str,
    authorization: str = Header(..., alias="Authorization")
):
    """Получение информации заказа по id (дизайн, цены и т.д.)"""
    token = authorization.replace("Bearer ", "")
    current_user = await get_current_user(token)

    order = await get_order_by_id(order_id)

    # Проверка прав: admin/worker ИЛИ владелец заказа
    if current_user["role"] not in ["admin", "worker"]:
        if order.client.client_id != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Доступ запрещен")

    return order


@router.get("/orders")
async def get_orders(
    authorization: str = Header(..., alias="Authorization")
):
    """Получение списка ID заказов для клиента (проверка владельца по JWT)"""
    token = authorization.replace("Bearer ", "")
    current_user = await get_current_user(token)

    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Доступ только для клиентов")

    orders_ids = await get_orders_ids_by_client(current_user["user_id"])

    return {
        "orders_ids": orders_ids
    }


@router.post("/order/new", status_code=201)
async def create_order(
    order_data: OrderCreate,
    authorization: str = Header(..., alias="Authorization")
):
    """Создание нового заказа для пользователя"""
    token = authorization.replace("Bearer ", "")
    current_user = await get_current_user(token)

    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Только клиенты могут создавать заказы")

    order_id = await create_new_order(
        order_data,
        current_user["user_id"],
        current_user["username"]
    )

    return {"id": order_id, "message": "Заказ создан"}


# Дополнительные эндпоинты для админов
@router.get("/admin/orders")
async def admin_get_all_orders(
    authorization: str = Header(..., alias="Authorization")
):
    """Получить все заказы (только для админов)"""
    token = authorization.replace("Bearer ", "")
    current_user = await get_current_user(token)

    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Доступ только для администраторов")

    return await get_all_orders()


@router.patch("/admin/order/{order_id}")
async def admin_update_order(
    order_id: str,
    order_update: OrderUpdate,
    authorization: str = Header(..., alias="Authorization")
):
    """Обновить заказ (только для админов)"""
    token = authorization.replace("Bearer ", "")
    current_user = await get_current_user(token)

    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Доступ только для администраторов")

    return await update_order(order_id, order_update)


@router.delete("/admin/order/{order_id}", status_code=204)
async def admin_delete_order(
    order_id: str,
    authorization: str = Header(..., alias="Authorization")
):
    """Удалить заказ (только для админов)"""
    token = authorization.replace("Bearer ", "")
    current_user = await get_current_user(token)

    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Доступ только для администраторов")

    await delete_order(order_id)
    return None
