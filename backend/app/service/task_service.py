from fastapi import HTTPException
from app.models.order import Task, TypeStage, TypeStatus, TypeTask
from app.models.design import TypeDesign
from app.data import task_repository as task_repo
from typing import List, Optional, Tuple
from datetime import datetime


async def get_tasks(user_id: str, role: str) -> List[Task]:
    if role == "admin":
        return await task_repo.get_all_tasks(worker_id=None)
    elif role == "worker":
        return await task_repo.get_all_tasks(worker_id=user_id)
    else:
        raise HTTPException(status_code=403, detail="Доступ только для worker и admin")


async def get_tasks_by_worker(worker_id: str, role: str, target_worker_id: str) -> List[Task]:
    if role == "worker" and worker_id != target_worker_id:
        raise HTTPException(status_code=403, detail="Доступ запрещён")
    if role not in ("admin", "worker"):
        raise HTTPException(status_code=403, detail="Доступ только для worker и admin")
    return await task_repo.get_tasks_by_worker(target_worker_id)


async def take_task(order_id: str, stage_index: int, worker_id: str, role: str) -> dict:
    if role not in ("admin", "worker"):
        raise HTTPException(status_code=403, detail="Доступ только для worker и admin")
    stage = await task_repo.get_stage(order_id, stage_index)
    if not stage:
        raise HTTPException(status_code=404, detail="Этап не найден")
    if stage.get("worker_id") and stage["worker_id"] != "":
        raise HTTPException(status_code=400, detail="На этот этап уже назначен рабочий")
    if stage.get("task_status") == TypeTask.In_progress.value:
        raise HTTPException(status_code=400, detail="Этап уже в процессе")
    if stage.get("task_status") != TypeTask.Available.value:
        raise HTTPException(status_code=400, detail="Этап недоступен для назначения")
    success = await task_repo.take_task(order_id, stage_index, worker_id)
    if not success:
        raise HTTPException(status_code=500, detail="Не удалось назначить рабочего")
    return {"order_id": order_id, "stage_index": stage_index, "message": "Задача взята в работу"}


async def complete_task(order_id: str, stage_index: int, worker_id: str, role: str) -> dict:
    if role not in ("admin", "worker"):
        raise HTTPException(status_code=403, detail="Доступ только для worker и admin")
    stage = await task_repo.get_stage(order_id, stage_index)
    if stage is None:
        raise HTTPException(status_code=404, detail="Этап не найден")
    if role == "worker" and stage.get("worker_id") != worker_id:
        raise HTTPException(status_code=403, detail="Это не ваша задача")
    if stage.get("task_status") != TypeTask.In_progress.value:
        raise HTTPException(status_code=400, detail=f"Можно завершить только задачу в процессе (текущий статус: {stage.get('task_status')})")
    success = await task_repo.complete_task(order_id, stage_index)
    if not success:
        raise HTTPException(status_code=500, detail="Не удалось завершить задачу")
    return {"order_id": order_id, "stage_index": stage_index, "message": "Задача завершена"}


async def get_filtered_tasks_for_worker(
    worker_id: str,
    name_design: str,
    type_kitchen: TypeDesign,
    material: str,
    order_id: str,
    design_id: str,
    material_id: str,
    name_stage: TypeStage,
    stage_status: TypeStatus,
    task_status: TypeTask,
    min_estimated_time: int,
    max_estimated_time: int,
    from_created: Optional[datetime],
    to_created: Optional[datetime],
    from_deadline: Optional[datetime],
    to_deadline: Optional[datetime],
    sort_by: str,
    sort_direction: int,
    skip: int,
    limit: int
) -> Tuple[List[Task], int]:
    raw, total = await task_repo.get_filtered_tasks_for_worker(
        worker_id=worker_id,
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
        skip=skip,
        limit=limit
    )
    tasks = []
    for doc in raw:
        doc.pop("remaining_time_minutes", None)
        tasks.append(Task(**doc))
    return tasks, total
