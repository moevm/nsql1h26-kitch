from fastapi import HTTPException, status
from app.models.order import Order, OrderInDB, OrderUpdate, OrderCreate, Client, Delivery, Pricing
from app.data import order_repository as order_repo
from app.data import design_data as design_repo
from typing import List


async def get_all_orders() -> List[Order]:
    try:
        orders_db = await order_repo.get_all()
        return [Order(**order.model_dump()) for order in orders_db]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении заказов: {str(e)}"
        )


async def get_order_by_id(order_id: str) -> Order:
    order_db = await order_repo.get_by_id(order_id)
    if order_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Заказ с ID {order_id} не найден"
        )
    return Order(**order_db.model_dump())


async def get_orders_by_client(client_id: str) -> List[Order]:
    orders_db = await order_repo.get_by_client_id(client_id)
    return [Order(**order.model_dump()) for order in orders_db]


async def get_orders_ids_by_client(client_id: str) -> List[str]:
    orders_db = await order_repo.get_by_client_id(client_id)
    return [str(order.id) for order in orders_db]


async def create_new_order(order_data: OrderCreate, user_id: str, username: str) -> str:
    # Получаем дизайн
    design = await design_repo.get_by_id(order_data.design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Дизайн не найден")

    # Получаем материал
    from app.data import material_data as material_repo
    material = await material_repo.get_by_id(order_data.material)
    if not material:
        raise HTTPException(status_code=404, detail="Материал не найден")

    # Рассчитываем total_price
    total_price = (
        order_data.type_price +
        order_data.material_price +
        order_data.delivery_price +
        order_data.comment_price
    )

    # Собираем заказ
    order_dict = {
        "material_id": order_data.material,
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
        "size": design.size,
        "color": order_data.color,
        "need_material": design.need_material,
        "blueprint": design.blueprint or 0
    }

    order_in_db = OrderInDB(**order_dict)
    return await order_repo.create(order_in_db)


async def update_order(order_id: str, order_update: OrderUpdate) -> Order:
    await get_order_by_id(order_id)

    update_data = order_update.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нет данных для обновления"
        )

    success = await order_repo.update(order_id, update_data)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось обновить заказ"
        )

    updated_order = await order_repo.get_by_id(order_id)
    return Order(**updated_order.model_dump())


async def delete_order(order_id: str) -> bool:
    await get_order_by_id(order_id)
    success = await order_repo.delete(order_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось удалить заказ"
        )
    return True
