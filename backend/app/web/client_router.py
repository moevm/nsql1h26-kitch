from fastapi import APIRouter, Header, HTTPException
from app.service.auth_service import get_current_user
from app.service.order_service import get_orders_ids_by_client

router = APIRouter(prefix="/api/client", tags=["client"])


@router.get("/")
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


@router.get("/orders")
async def get_client_orders(
    authorization: str = Header(..., alias="Authorization")
):
    token = authorization.replace("Bearer ", "")
    current_user = await get_current_user(token)

    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Доступ только для клиентов")

    orders_ids = await get_orders_ids_by_client(current_user["user_id"])

    return {
        "orders_ids": orders_ids
    }
