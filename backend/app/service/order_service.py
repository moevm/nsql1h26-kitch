from fastapi import HTTPException, status
from app.models.order import Order, OrderInDB, OrderCreate, Client, Delivery, Pricing
from app.data import order_repository as order_repo
from app.data import design_data as design_repo
from typing import List


async def get_order_by_id(order_id: str) -> Order:
    order_db = await order_repo.get_by_id(order_id)
    if order_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Заказ с ID {order_id} не найден"
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


async def create_new_order(order_data: OrderCreate, user_id: str, username: str, role: str) -> str:
    if role != "client":
        raise HTTPException(status_code=403, detail="Только клиенты могут создавать заказы")
    design = await design_repo.get_by_id(order_data.design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Дизайн не найден")

    from app.data import material_data as material_repo
    material = await material_repo.get_by_name(order_data.material)
    if not material:
        raise HTTPException(status_code=404, detail="Материал не найден")

    total_price = (
        order_data.type_price +
        order_data.material_price +
        order_data.delivery_price +
        order_data.comment_price
    )

    order_dict = {
        "material_id": str(material.id),
        "design_id": order_data.design_id,
        "client": Client(
            client_id=user_id,
            username=username,
            phone=order_data.phone
        ),
        "item": order_data.kitchen_type,
        "delivery": Delivery(
            address=order_data.address,
            floor=order_data.floor,
            has_lift=order_data.has_lift
        ),
        "pricing": Pricing(
            total_price=total_price,
            type_price=order_data.type_price,
            material_price=order_data.material_price,
            delivery_price=order_data.delivery_price,
            comment_price=order_data.comment_price
        ),
        "stages": [],
        "comment": order_data.comment or "",
        "name_design": design.name,
        "type": design.type,
        "material": material.name,
        "size": design.size.model_dump() if hasattr(design.size, 'model_dump') else dict(design.size),
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
            raise HTTPException(status_code=403, detail="Вы можете отменить только свои заказы")

    success = await order_repo.cancel(order_id)
    if not success:
        raise HTTPException(status_code=500, detail="Не удалось отменить заказ")

    return {
        "order_id": order_id,
        "message": "Заказ успешно отменён"
    }
