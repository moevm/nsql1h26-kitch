from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.service.auth_service import get_current_user_dep
from app.service.worker_service import (
    get_workers,
    get_worker_by_id,
    create_new_worker,
    edit_worker_by_id,
    delete_worker_by_id,
    get_filtered_workers_for_admin,
    get_count_users
)
from app.models.user import WorkerCreate, WorkerPublic, WorkerUpdate
from datetime import datetime

ALLOWED_SORTED_FIELDS = {
    "created_at",
    "name_worker",
    "worker_position",
    "count_completed_tasks",
    "count_overdue_tasks",
    "count_failed_tasks"
}

router = APIRouter(prefix="/api", tags=["workers"])


@router.get(
    "/workers/filter",
    response_model=List[WorkerPublic],
    summary="Получить отфильтрованный список работников",
    description="""
    Возвращает отфильтрованный список работников для админа с регистронезависимым поиском
    """
)
async def get_filtered_workers_admin(
        name_worker: str = None,
        worker_position: str = None,
        start_workday: str = None,
        end_workday: str = None,
        min_completed_tasks: int = None,
        max_completed_tasks: int = None,
        min_overdue_tasks: int = None,
        max_overdue_tasks: int = None,
        min_failed_tasks: int = None,
        max_failed_tasks: int = None,
        from_created: Optional[datetime] = None,
        to_created: Optional[datetime] = None,
        sort_by: str = "created_at",
        sort: str = "ASC",
        start: int = 0,
        limit: int = -1,
        current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Только админы могут просматривать работников")

    if sort_by not in ALLOWED_SORTED_FIELDS:
        raise HTTPException(status_code=400,
                            detail=f"Не может быть отсортировано по {sort_by}. Используйте что-то из списка {ALLOWED_SORTED_FIELDS}")

    if sort.upper() not in {"ASC", "DESC"}:
        raise HTTPException(status_code=400, detail="sort может быть только 'ASC' или 'DESC'")
    sort_direction = 1 if sort.upper() == "ASC" else -1

    if limit < -1:
        limit = 1
    elif limit == 0:
        raise HTTPException(status_code=400, detail="limit должен быть больше 0")

    workers = await get_filtered_workers_for_admin(
        name_worker=name_worker,
        worker_position=worker_position,
        start_workday=start_workday,
        end_workday=end_workday,
        min_completed_tasks=min_completed_tasks,
        max_completed_tasks=max_completed_tasks,
        min_overdue_tasks=min_overdue_tasks,
        max_overdue_tasks=max_overdue_tasks,
        min_failed_tasks=min_failed_tasks,
        max_failed_tasks=max_failed_tasks,
        from_created=from_created,
        to_created=to_created,
        sort_by=sort_by,
        sort_direction=sort_direction,
        skip=start,
        limit=limit
    )

    return workers


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
    "/workers/count",
    response_model=int,
    summary="Получить количество работников",
    description="""
    Возвращает количество работников для админа
    False = только работники
    True = все пользователи
    """
)
async def get_count(all_users: bool = False, current_user: dict = Depends(get_current_user_dep)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Только админы могут просматривать работников")

    return await get_count_users(all_users)


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
async def edit_worker_profile(worker_id: str, worker_data: WorkerUpdate,
                              current_user: dict = Depends(get_current_user_dep)):
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
