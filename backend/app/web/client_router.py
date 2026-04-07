from fastapi import APIRouter, Header, HTTPException, Depends
from app.service.auth_service import get_current_user
from app.data.order_repository import get_orders_by_user_id

router = APIRouter(prefix="/api/client", tags=["client"])

@router.get("/", summary="Получение информации о клиенте")
async def get_client_info(
    authorization: str = Header(..., alias="Authorization")
):
    token = authorization.replace("Bearer ", "")
    current_user = await get_current_user(token)

    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Доступ только для клиентов")

    return {
        "id": current_user["user_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "phone": current_user.get("phone"),
        "role": current_user["role"]
    }


@router.get("/orders", status_code="Получение списка заказов клиента")
async def get_client_orders(
    authorization: str = Header(..., alias="Authorization")
):
    token = authorization.replace("Bearer ", "")
    current_user = await get_current_user(token)

    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Доступ только для клиентов")

    orders = await get_orders_by_user_id(current_user["user_id"])

    return {
        "user_id": current_user["user_id"],
        "total_orders": len(orders),
        "orders": orders
    }
