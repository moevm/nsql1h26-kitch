from fastapi import APIRouter, HTTPException, Depends
from app.service.auth_service import get_current_user_dep
from app.service.order_service import get_orders_ids_by_client

router = APIRouter(prefix="/api/client", tags=["client"])

@router.get("/")
async def get_client_info(
    current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Доступ только для клиентов")

    return {
        "id": current_user["user_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"]
    }

@router.get("/orders")
async def get_client_orders(
    current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Доступ только для клиентов")

    orders_ids = await get_orders_ids_by_client(current_user["user_id"])
    return {"orders_ids": orders_ids}
