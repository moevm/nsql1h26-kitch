from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.service.auth_service import get_current_user_dep
from app.service.worker_service import (
    get_workers,
    get_worker_by_id,
    create_new_worker,
    edit_worker_by_id,
    delete_worker_by_id
)
from app.models.user import WorkerCreate, WorkerPublic, WorkerUpdate


router = APIRouter(prefix="/api", tags=["workers"])


@router.get(
    "/workers",
    response_model=List[WorkerPublic],
    summary="Получить список работников",
    description="""
    Возвращает всех работников для админа
    """
)
async def get_workers_for_admin(current_user: dict = Depends(get_current_user_dep)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Только админы могут просматривать работников")
    
    return await get_workers()


@router.get(
    "/workers/{worker_id}",
    response_model=WorkerPublic,
    summary="Получить работника по id",
    description="""
    Возвращает конкретного работника по id для админа
    """
)
async def get_worker(worker_id: str, current_user: dict = Depends(get_current_user_dep)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Только админы могут просматривать работников")
    
    return await get_worker_by_id(worker_id)


@router.post(
    "/workers/new",
    status_code=201,
    response_model=dict,
    summary="Создать нового работника",
    description="""
    Создаёт аккаунт для нового работника и генерирует случайный пароль
    """
)
async def create_worker(worker_data: WorkerCreate, current_user: dict = Depends(get_current_user_dep)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Только админы могут создавать работников")
    
    worker_id, password = await create_new_worker(worker_data)

    return {"id": worker_id, "password": password, "message": "Аккаунт для работника успешно создан"}


@router.patch(
    "/workers/{worker_id}",
    status_code=200,
    response_model=dict,
    summary="Изменить профиль работника",
    description="""
    Изменение профиля о работнике через PATCH только для админа
    """
)
async def edit_worker_profile(worker_id: str, worker_data: WorkerUpdate, current_user: dict = Depends(get_current_user_dep)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Только админы могут просматривать работников")
    
    result = await edit_worker_by_id(worker_id, worker_data)

    return result


@router.delete(
    "/workers/{worker_id}",
    status_code=200,
    response_model=dict,
    summary="Мягкое удаление работника",
    description="""
    Мягкое удаление работника, в базе данных ставится дата увольнения работника и освобождаются все заказы. Доступ только для админа
    """
)
async def delete_worker(worker_id: str, current_user: dict = Depends(get_current_user_dep)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Только админы могут просматривать работников")
    
    result = await delete_worker_by_id(worker_id)

    return result