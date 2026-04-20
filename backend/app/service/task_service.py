from fastapi import HTTPException
from app.models.order import Task, TypeTask
from app.data import task_repository as task_repo
from typing import List


async def get_tasks(user_id: str, role: str) -> List[Task]:
    if role == "admin":
        return await task_repo.get_all_tasks(worker_id=None)
    elif role == "worker":
        return await task_repo.get_all_tasks(worker_id=user_id)
    else:
        raise HTTPException(status_code=403, detail="Доступ только для worker и admin")


async def get_tasks_by_worker(
    worker_id: str, role: str, target_worker_id: str
) -> List[Task]:
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

    return {
        "order_id": order_id,
        "stage_index": stage_index,
        "message": "Задача взята в работу",
    }


async def complete_task(
    order_id: str, stage_index: int, worker_id: str, role: str
) -> dict:
    if role not in ("admin", "worker"):
        raise HTTPException(status_code=403, detail="Доступ только для worker и admin")

    stage = await task_repo.get_stage(order_id, stage_index)
    if not stage:
        raise HTTPException(status_code=404, detail="Этап не найден")

    if role == "worker" and stage.get("worker_id") != worker_id:
        raise HTTPException(status_code=403, detail="Это не ваша задача")

    if stage.get("task_status") != TypeTask.In_progress.value:
        raise HTTPException(
            status_code=400, detail="Можно завершить только задачу в процессе"
        )

    success = await task_repo.complete_task(order_id, stage_index)
    if not success:
        raise HTTPException(status_code=500, detail="Не удалось завершить задачу")

    return {
        "order_id": order_id,
        "stage_index": stage_index,
        "message": "Задача завершена",
    }
