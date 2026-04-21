from app.data.database import db
from app.models.order import OrderInDB, TypeTask, Task, TypeStage
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timezone

orders_collection = db["orders"]


def _build_tasks(docs: list, worker_id: Optional[str] = None) -> List[Task]:
    """Собирает Task объекты из документов заказов"""
    tasks = []
    for doc in docs:
        doc["id"] = str(doc["_id"])
        order = OrderInDB(**doc)
        order_id = str(order.id)

        for stage in order.stages:
            if worker_id and stage.worker_id != worker_id:
                continue
            tasks.append(
                Task(
                    order_id=order_id,
                    stage_index=order.stages.index(stage),
                    stage_name=stage.name_stage,
                    status=stage.task_status,
                    name_design=order.name_design,
                    type=order.type,
                    color=order.color,
                    material=order.material,
                    times=stage.times,
                    worker_id=stage.worker_id,
                )
            )
    return tasks


async def get_all_tasks(worker_id: Optional[str] = None) -> List[Task]:
    """Все задачи — для admin все, для worker только свои"""
    query = {} if worker_id is None else {"stages.worker_id": worker_id}
    cursor = orders_collection.find(query)
    docs = await cursor.to_list(length=1000)
    return _build_tasks(docs, worker_id)


async def get_tasks_by_worker(worker_id: str) -> List[Task]:
    """Задачи конкретного рабочего (история)"""
    cursor = orders_collection.find({"stages.worker_id": worker_id})
    docs = await cursor.to_list(length=1000)
    return _build_tasks(docs, worker_id)


async def take_task(order_id: str, stage_index: int, worker_id: str) -> bool:
    """Назначить рабочего на этап и поставить статус In_progress"""
    now = datetime.now(timezone.utc)
    result = await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                f"stages.{stage_index}.worker_id": worker_id,
                f"stages.{stage_index}.task_status": TypeTask.In_progress.value,
                f"stages.{stage_index}.times.start": now,
                "updated_at": now,
            }
        },
    )
    return result.modified_count > 0


async def complete_task(order_id: str, stage_index: int) -> bool:
    """Завершить этап и открыть следующий"""
    from datetime import timedelta

    now = datetime.now(timezone.utc)

    doc = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not doc:
        return False

    stages = doc.get("stages", [])
    if stage_index >= len(stages):
        return False

    stage = stages[stage_index]
    deadline = stage.get("times", {}).get("deadline")

    if deadline and deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)

    # просрочена или выполнена
    if deadline and now > deadline:
        final_status = TypeTask.Overdue.value
    else:
        final_status = TypeTask.Completed.value

    update = {
        f"stages.{stage_index}.task_status": final_status,
        f"stages.{stage_index}.times.end": now,
        "updated_at": now,
    }

    # открываем след этап если есть
    next_index = stage_index + 1
    if next_index < len(stages):
        update[f"stages.{next_index}.task_status"] = TypeTask.Available.value
        update[f"stages.{next_index}.times.start"] = now
        # дедлайн следующего = старт + est_time минут
        next_est = stages[next_index].get("times", {}).get("est_time", 2880)
        from datetime import timedelta

        update[f"stages.{next_index}.times.deadline"] = now + timedelta(
            minutes=next_est
        )

    result = await orders_collection.update_one(
        {"_id": ObjectId(order_id)}, {"$set": update}
    )
    return result.modified_count > 0


async def get_stage(order_id: str, stage_index: int) -> Optional[dict]:
    """Получить конкретный этап"""
    doc = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not doc:
        return None
    stages = doc.get("stages", [])
    if stage_index >= len(stages):
        return None
    return stages[stage_index]
