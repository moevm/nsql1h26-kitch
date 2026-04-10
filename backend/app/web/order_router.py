from fastapi import APIRouter, HTTPException, Depends
from app.service.auth_service import get_current_user_dep
from app.service.order_service import (
    get_order_by_id, get_orders_ids_by_client,
    create_new_order, update_order, delete_order, get_all_orders
)
from app.models.order import OrderCreate, OrderUpdate

router = APIRouter(prefix="/api", tags=["orders"])

@router.get("/order/{order_id}")
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user_dep)
):
    order = await get_order_by_id(order_id)

    if current_user["role"] not in ["admin", "worker"]:
        if order.client.client_id != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Доступ запрещен")

    return order

@router.get("/orders")
async def get_orders(
    current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Доступ только для клиентов")

    orders_ids = await get_orders_ids_by_client(current_user["user_id"])
    return {"orders_ids": orders_ids}

@router.post("/order/new", status_code=201)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Только клиенты могут создавать заказы")

    order_id = await create_new_order(
        order_data,
        current_user["user_id"],
        current_user["username"]
    )
    return {"id": order_id, "message": "Заказ создан"}

@router.get("/admin/orders")
async def admin_get_all_orders(
    current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Доступ только для администраторов")

    return await get_all_orders()

@router.patch("/admin/order/{order_id}")
async def admin_update_order(
    order_id: str,
    order_update: OrderUpdate,
    current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Доступ только для администраторов")

    return await update_order(order_id, order_update)

@router.delete("/admin/order/{order_id}", status_code=204)
async def admin_delete_order(
    order_id: str,
    current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Доступ только для администраторов")

    await delete_order(order_id)
    return None
