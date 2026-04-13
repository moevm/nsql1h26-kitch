from fastapi import APIRouter, HTTPException, Depends
from app.service.auth_service import get_current_user_dep
from app.service.task_service import (
    get_tasks_by_status
)
from app.models.order import TypeTask


router = APIRouter(prefix="/api", tags=["task"])


TASK_STATUS_MAP = {
    "available": "Доступна",
    "in_progress": "В процессе",
    "completed": "Выполнена",
    "overdue": "Просрочена",
    "canceled": "Отменена"
}

@router.get("/tasks/{task_status}")
async def get_tasks_by_status(
    task_status: str,
    start: int = 0,
    limit: int = -1,
    current_user: dict = Depends(get_current_user_dep)
):
    if task_status not in TASK_STATUS_MAP:
        raise HTTPException(status_code=400, detail="Неверный статус задачи")

    try:
        db_status = TypeTask[TASK_STATUS_MAP[task_status]]
    except ValueError:
        raise HTTPException(status_code=400, detail="Некорректное значение статуса задачи")
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Доступ запрещен")

    return get_tasks_by_status(task_status, start, limit)

