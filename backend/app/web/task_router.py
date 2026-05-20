from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.service.auth_service import get_current_user_dep
from app.service.task_service import (
    get_tasks,
    get_tasks_by_worker,
    take_task,
    complete_task,
    get_filtered_tasks_for_worker,
)
from app.models.order import Task, TypeDesign, TypeStage, TypeStatus, TypeTask
from pydantic import BaseModel
from datetime import datetime

ALLOWED_SORTED_FIELDS = {
    "created_at",
    "material",
    "name_design",
    "name_stage",
    "task_status",
    "type_kitchen",
    "estimated_time",
    "deadline"
}

router = APIRouter(prefix="/api", tags=["tasks"])


class TakeTaskRequest(BaseModel):
    worker_id: str


@router.get(
    "/tasks/filter",
    response_model=dict,
    summary="Получить отфильтрованный список задач",
    description="Возвращает отфильтрованный список задач для работника и общее количество",
)
async def get_filtered_list_tasks(
        name_design: str = None,
        type_kitchen: TypeDesign = None,
        material: str = None,
        order_id: str = None,
        design_id: str = None,
        material_id: str = None,
        name_stage: TypeStage = None,
        stage_status: TypeStatus = None,
        task_status: TypeTask = None,
        min_estimated_time: int = None,
        max_estimated_time: int = None,
        from_created: Optional[datetime] = None,
        to_created: Optional[datetime] = None,
        from_deadline: Optional[datetime] = None,
        to_deadline: Optional[datetime] = None,
        sort_by: str = "created_at",
        sort: str = "ASC",
        start: int = 0,
        limit: int = -1,
        current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "worker":
        raise HTTPException(status_code=403, detail="Только работники могут просматривать задачи")
    if sort_by not in ALLOWED_SORTED_FIELDS:
        raise HTTPException(status_code=400, detail=f"Не может быть отсортировано по {sort_by}. Используйте что-то из списка {ALLOWED_SORTED_FIELDS}")
    if sort.upper() not in {"ASC", "DESC"}:
        raise HTTPException(status_code=400, detail="sort может быть только 'ASC' или 'DESC'")
    sort_direction = 1 if sort.upper() == "ASC" else -1
    if limit < -1:
        limit = 1
    elif limit == 0:
        raise HTTPException(status_code=400, detail="limit должен быть больше 0")
    items, total = await get_filtered_tasks_for_worker(
        worker_id=current_user["user_id"],
        name_design=name_design,
        type_kitchen=type_kitchen,
        material=material,
        order_id=order_id,
        design_id=design_id,
        material_id=material_id,
        name_stage=name_stage,
        stage_status=stage_status,
        task_status=task_status,
        min_estimated_time=min_estimated_time,
        max_estimated_time=max_estimated_time,
        from_created=from_created,
        to_created=to_created,
        from_deadline=from_deadline,
        to_deadline=to_deadline,
        sort_by=sort_by,
        sort_direction=sort_direction,
        skip=start,
        limit=limit
    )
    return {"items": items, "total": total}


@router.get(
    "/tasks",
    response_model=List[Task],
    summary="Получить список задач",
)
async def get_all_tasks(current_user: dict = Depends(get_current_user_dep)):
    return await get_tasks(current_user["user_id"], current_user["role"])


@router.get(
    "/tasks/worker/{worker_id}",
    response_model=List[Task],
    summary="Получить задачи рабочего по ID",
)
async def get_worker_tasks(worker_id: str, current_user: dict = Depends(get_current_user_dep)):
    return await get_tasks_by_worker(
        worker_id=current_user["user_id"],
        role=current_user["role"],
        target_worker_id=worker_id,
    )


@router.patch(
    "/tasks/{order_id}/{stage_index}/take",
    response_model=dict,
    summary="Взять задачу в работу",
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
