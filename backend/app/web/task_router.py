from fastapi import APIRouter, HTTPException, Depends
from app.service.auth_service import get_current_user_dep
from app.service.task_service import get_tasks_by_status
from app.models.order import TypeTask

router = APIRouter(prefix="/api", tags=["task"])


TASK_STATUS_MAP = {
    "available": "Доступна",
    "in_progress": "В процессе",
    "completed": "Выполнена",
    "overdue": "Просрочена",
    "canceled": "Отменена",
}


@router.get("/tasks/{task_status}")
async def get_tasks_by_status_admin(
    task_status: str,
    start: int = 0,
    limit: int = -1,
    current_user: dict = Depends(get_current_user_dep),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Доступ только для админа")

    if task_status not in TASK_STATUS_MAP:
        raise HTTPException(status_code=400, detail="Неверный статус задачи")

    try:
        db_status = TypeTask(TASK_STATUS_MAP[task_status])
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Некорректное значение статуса задачи"
        )

    return await get_tasks_by_status(db_status, start, limit, worker_id=None)


@router.get("/worker/tasks/{task_status}")
async def get_tasks_by_status_worker(
    task_status: str,
    start: int = 0,
    limit: int = -1,
    current_user: dict = Depends(get_current_user_dep),
):
    if task_status not in TASK_STATUS_MAP:
        raise HTTPException(status_code=400, detail="Неверный статус задачи")

    try:
        db_status = TypeTask(TASK_STATUS_MAP[task_status])
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Некорректное значение статуса задачи"
        )

    worker_id = None
    if current_user["role"] == "worker":
        worker_id = current_user["user_id"]
    else:
        raise HTTPException(status_code=403, detail="Доступ только для работников")

    if worker_id is None:
        raise HTTPException(status_code=400, detail="Некорректный id работника")

    return await get_tasks_by_status(db_status, start, limit, worker_id)
