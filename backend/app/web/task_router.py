from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.service.auth_service import get_current_user_dep
from app.service.task_service import (
    get_tasks,
    get_tasks_by_worker,
    take_task,
    complete_task,
)
from app.models.order import Task
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["tasks"])


class TakeTaskRequest(BaseModel):
    worker_id: str


@router.get(
    "/tasks",
    response_model=List[Task],
    summary="Получить список задач",
    description="""
    Возвращает задачи в зависимости от роли:
    - **WORKER**: только свои задачи
    - **ADMIN**: все задачи
    """,
)
async def get_all_tasks(current_user: dict = Depends(get_current_user_dep)):
    return await get_tasks(current_user["user_id"], current_user["role"])


@router.get(
    "/tasks/worker/{worker_id}",
    response_model=List[Task],
    summary="Получить задачи рабочего по ID",
    description="""
    Возвращает все задачи в которых участвовал рабочий:
    - **WORKER**: только свои задачи
    - **ADMIN**: задачи любого рабочего
    """,
)
async def get_worker_tasks(
    worker_id: str, current_user: dict = Depends(get_current_user_dep)
):
    return await get_tasks_by_worker(
        worker_id=current_user["user_id"],
        role=current_user["role"],
        target_worker_id=worker_id,
    )


@router.patch(
    "/tasks/{order_id}/{stage_index}/take",
    response_model=dict,
    summary="Взять задачу в работу",
    description="""
    Назначает рабочего на этап и ставит статус **В процессе**.
    Можно взять только задачу со статусом **Доступна** без назначенного рабочего.
    - **WORKER**: назначает себя
    - **ADMIN**: назначает любого
    """,
)
async def take_task_endpoint(
    order_id: str,
    stage_index: int,
    body: TakeTaskRequest,
    current_user: dict = Depends(get_current_user_dep),
):
    return await take_task(
        order_id=order_id,
        stage_index=stage_index,
        worker_id=body.worker_id,
        role=current_user["role"],
    )


@router.patch(
    "/tasks/{order_id}/{stage_index}/complete",
    response_model=dict,
    summary="Завершить задачу",
    description="""
    Завершает текущий этап и открывает следующий.
    Статус следующего этапа становится **Доступна**.
    - **WORKER**: только свою задачу
    - **ADMIN**: любую задачу
    """,
)
async def complete_task_endpoint(
    order_id: str, stage_index: int, current_user: dict = Depends(get_current_user_dep)
):
    return await complete_task(
        order_id=order_id,
        stage_index=stage_index,
        worker_id=current_user["user_id"],
        role=current_user["role"],
    )
