from bson import ObjectId
from app.data.database import db
from app.models.user import UserInDB, WorkerInDB
from datetime import datetime, timezone
from typing import Optional, List, Tuple

SORT_FIELD_MAP = {
    "name_worker": "username",
    "worker_position": "last_position",
    "count_completed_tasks": "completed_tasks",
    "count_overdue_tasks": "overdue_tasks",
    "count_failed_tasks": "failed_tasks",
    "created_at": "created_at"
}

users_collection = db["users"]


async def get_user_by_email(email: str) -> dict | None:
    return await users_collection.find_one({"email": email})


async def create_user(user: UserInDB) -> str:
    result = await users_collection.insert_one(user.model_dump(by_alias=True))
    return str(result.inserted_id)


async def get_user_by_id(id: str) -> dict | None:
    try:
        obj_id = ObjectId(id)
        user = await users_collection.find_one({"_id": obj_id})
        return user
    except:
        print(f"Invalid ObjectId: {id}")
        return None


async def get_workers() -> List[WorkerInDB]:
    try:
        cursor = users_collection.find({"role": "worker"})
        docs = await cursor.to_list(length=1000)
        return [WorkerInDB(**doc) for doc in docs]
    except Exception as e:
        print(f"Error getting workers: {e}")
        return []


async def get_worker_by_id(worker_id: str) -> WorkerInDB | None:
    try:
        doc = await users_collection.find_one({"_id": ObjectId(worker_id), "role": "worker"})
        if doc is not None:
            return WorkerInDB(**doc)
    except Exception as e:
        print(f"Error getting worker: {e}")
        return None


async def create_new_worker(worker: WorkerInDB) -> str:
    data = worker.model_dump(by_alias=True)
    if "_id" in data and isinstance(data["_id"], str):
        data["_id"] = ObjectId(data["_id"])
    result = await users_collection.insert_one(data)
    return str(result.inserted_id)


async def edit_worker_by_id(worker_id: str, update_dict: dict) -> bool:
    if "$set" not in update_dict and "$push" not in update_dict:
        update_dict = {"$set": update_dict}
    update_dict.setdefault("$set", {})["updated_at"] = datetime.now(timezone.utc)
    result = await users_collection.update_one(
        {"_id": ObjectId(worker_id), "role": "worker"},
        update_dict
    )
    return result.modified_count > 0


async def delete_worker_by_id(worker_id: str) -> bool:
    result = await users_collection.update_one(
        {"_id": ObjectId(worker_id), "role": "worker"},
        {"$set": {
            "worker_info.date_of_remove": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return result.modified_count > 0


async def get_filtered_workers_for_admin(
        name_worker: Optional[str],
        worker_position: Optional[str],
        start_workday: Optional[str],
        end_workday: Optional[str],
        min_completed_tasks: int,
        max_completed_tasks: int,
        min_overdue_tasks: int,
        max_overdue_tasks: int,
        min_failed_tasks: int,
        max_failed_tasks: int,
        from_created: Optional[datetime],
        to_created: Optional[datetime],
        sort_by: str,
        sort_direction: int,
        skip: int,
        limit: int
) -> Tuple[List[dict], int]:
    if limit == 0:
        return [], 0
    elif limit <= -1:
        limit = 1000

    try:
        match_filter = {"role": "worker"}
        if name_worker is not None:
            match_filter["username"] = {"$regex": name_worker, "$options": "i"}
        workday_filter = {}
        if start_workday is not None:
            workday_filter["$gte"] = start_workday
        if end_workday is not None:
            workday_filter["$lte"] = end_workday
        if workday_filter:
            match_filter["worker_info.work_day_start"] = workday_filter
            match_filter["worker_info.work_day_end"] = workday_filter
        created_filter = {}
        if from_created is not None:
            created_filter["$gte"] = from_created
        if to_created is not None:
            created_filter["$lte"] = to_created
        if created_filter:
            match_filter["created_at"] = created_filter

        pipeline = [{"$match": match_filter}]
        pipeline.append({
            "$lookup": {
                "from": "orders",
                "let": {"worker_id_str": {"$toString": "$_id"}},
                "pipeline": [
                    {"$match": {"$expr": {"$in": ["$$worker_id_str", "$stages.worker_id"]}}}
                ],
                "as": "orders",
            }
        })
        pipeline.append({
            "$addFields": {
                "allStages": {
                    "$reduce": {
                        "input": "$orders",
                        "initialValue": [],
                        "in": {"$concatArrays": ["$$value", "$$this.stages"]}
                    }
                }
            }
        })
        pipeline.append({
            "$addFields": {
                "workerStages": {
                    "$filter": {
                        "input": "$allStages",
                        "cond": {"$eq": ["$$this.worker_id", {"$toString": "$_id"}]}
                    }
                }
            }
        })
        pipeline.append({
            "$addFields": {
                "completed_tasks": {
                    "$size": {
                        "$filter": {
                            "input": "$workerStages",
                            "cond": {"$eq": ["$$this.task_status", "Выполнена"]}
                        }
                    }
                },
                "overdue_tasks": {
                    "$size": {
                        "$filter": {
                            "input": "$workerStages",
                            "cond": {"$eq": ["$$this.task_status", "Просрочена"]}
                        }
                    }
                },
                "failed_tasks": {
                    "$size": {
                        "$filter": {
                            "input": "$workerStages",
                            "cond": {"$eq": ["$$this.task_status", "Отменена"]}
                        }
                    }
                }
            }
        })

        tasks_filter = {}
        completed_tasks_filter = {}
        if min_completed_tasks is not None:
            completed_tasks_filter["$gte"] = min_completed_tasks
        if max_completed_tasks is not None:
            completed_tasks_filter["$lte"] = max_completed_tasks
        if completed_tasks_filter:
            tasks_filter["completed_tasks"] = completed_tasks_filter
        overdue_tasks_filter = {}
        if min_overdue_tasks is not None:
            overdue_tasks_filter["$gte"] = min_overdue_tasks
        if max_overdue_tasks is not None:
            overdue_tasks_filter["$lte"] = max_overdue_tasks
        if overdue_tasks_filter:
            tasks_filter["overdue_tasks"] = overdue_tasks_filter
        failed_tasks_filter = {}
        if min_failed_tasks is not None:
            failed_tasks_filter["$gte"] = min_failed_tasks
        if max_failed_tasks is not None:
            failed_tasks_filter["$lte"] = max_failed_tasks
        if failed_tasks_filter:
            tasks_filter["failed_tasks"] = failed_tasks_filter
        if tasks_filter:
            pipeline.append({"$match": tasks_filter})

        pipeline.append({
            "$addFields": {
                "last_position": {"$arrayElemAt": ["$worker_positions.position", -1]},
            }
        })
        if worker_position is not None:
            pipeline.append({"$match": {"last_position": {"$regex": worker_position, "$options": "i"}}})

        count_pipeline = pipeline.copy()
        count_pipeline.append({"$count": "total"})
        count_cursor = users_collection.aggregate(count_pipeline)
        count_docs = await count_cursor.to_list(length=1)
        total = count_docs[0]["total"] if count_docs else 0

        sort_field = SORT_FIELD_MAP.get(sort_by, "created_at")
        pipeline.append({"$sort": {sort_field: sort_direction}})
        if skip > 0:
            pipeline.append({"$skip": skip})
        pipeline.append({"$limit": limit})

        pipeline.append({
            "$project": {
                "orders": 0,
                "allStages": 0,
                "workerStages": 0,
                "last_position": 0,
                "completed_tasks": 0,
                "overdue_tasks": 0,
                "failed_tasks": 0
            }
        })

        cursor = users_collection.aggregate(pipeline)
        docs = await cursor.to_list(length=limit)
        result = []
        for doc in docs:
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)
            result.append(doc)
        return result, total

    except Exception as e:
        print(f"Error getting filtered workers: {e}")
        return [], 0
