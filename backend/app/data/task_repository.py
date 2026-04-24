from app.data.database import db
from app.models.order import OrderInDB, TypeTask, Task, TypeStage, TypeStatus
from app.models.design import TypeDesign
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timezone


SORT_FIELD_MAP = {
    "created_at": "created_at",
    "material": "material",
    "name_design": "name_design",
    "name_stage": "stage_name", #
    "task_status": "task_status",
    "type_kitchen": "type",
    "estimated_time":"times.est_time",
    "deadline": "times.deadline"
}


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
    min_estimated_time: int, # в минутах
    max_estimated_time: int,
    from_created: Optional[datetime],
    to_created: Optional[datetime],
    from_deadline: Optional[datetime],
    to_deadline: Optional[datetime],
    sort_by: str,
    sort_direction: int,
    skip: int,
    limit: int
) -> List[dict]:
    if limit == 0:
        return []
    elif limit <= -1:
        limit = 1000
    
    try:
        match_filter = {}

        if name_design is not None:
            match_filter["name_design"] = {"$regex": name_design, "$options": "i"}

        if material is not None:
            match_filter["material"] = {"$regex": material, "$options": "i"}
        
        if type_kitchen is not None:
            match_filter["type"] = type_kitchen.value
        
        if order_id is not None:
            match_filter["id"] = ObjectId(order_id)
        
        if design_id is not None:
            match_filter["design_id"] = design_id
        
        if material_id is not None:
            match_filter["material_id"] = material_id
        
        created_filter = {}
        if from_created is not None:
            created_filter["$gte"] = from_created
        if to_created is not None:
            created_filter["$lte"] = to_created
        if created_filter:
            match_filter["created_at"] = created_filter
        
        now = datetime.now(timezone.utc)
        pipeline = [
            {"$match": match_filter},
            {"$unwind": {"path": "$stages", "includeArrayIndex": "stage_index", "preserveNullAndEmptyArrays": False}},
            {"$match": {
                "$or": [
                    {"stages.worker_id": worker_id},
                    {"stages.worker_id": "", "stages.task_status": TypeTask.Available.value}
                ]
            }},
        ]

        stage_match = {}
        if name_stage is not None:
            stage_match["stages.name_stage"] = name_stage.value
        
        if stage_status is not None:
            stage_match["stages.stage_status"] = stage_status.value
        
        if task_status is not None:
            stage_match["stages.task_status"] = task_status.value
        
        deadline_filter = {}
        if from_deadline is not None:
            deadline_filter["$gte"] = from_deadline
        if to_deadline is not None:
            deadline_filter["$lte"] = to_deadline
        if deadline_filter:
            stage_match["stages.times.deadline"] = deadline_filter

        estimated_time_filter = {}
        if min_estimated_time is not None:
            estimated_time_filter["$gte"] = min_estimated_time
        if max_estimated_time is not None:
            estimated_time_filter["$lte"] = max_estimated_time
        if estimated_time_filter:
            stage_match["stages.times.est_time"] = estimated_time_filter

        if stage_match:
            pipeline.append({"$match": stage_match})

        pipeline.append({
            "$addFields": {
                "remaining_time_minutes": {
                    "$floor": {
                        "$divide": [
                            {"$subtract": ["$stages.times.deadline", now]},
                            60000  # ms в минуты
                        ]
                    }
                }
            }
        })

        pipeline.append({
            "$project": {
                "order_id": {"$toString": "$_id"},
                "stage_index": 1,
                "stage_name": "$stages.name_stage",
                "status": "$stages.task_status",
                "name_design": 1,
                "type": 1,
                "color": 1,
                "material": 1,
                "times": "$stages.times",
                "worker_id": "$stages.worker_id",
                "created_at": 1,
                "remaining_time_minutes": 1
            }
        })

        sort_field = SORT_FIELD_MAP.get(sort_by, "created_at")
        pipeline.append({"$sort": {sort_field: sort_direction}})
        if skip > 0:
            pipeline.append({"$skip": skip})
        pipeline.append({"$limit": limit})

        cursor = orders_collection.aggregate(pipeline)
        docs = await cursor.to_list(length=limit)

        result = []
        for doc in docs:
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)
            result.append(doc)
        
        return result

    except Exception as e:
        print(f"Error getting tasks in task_repository.get_filtered_tasks: {e}")
        return []
