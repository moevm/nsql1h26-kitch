from bson import ObjectId
from app.data.database import db
from app.models.user import UserInDB, WorkerInDB
from typing import List
from datetime import datetime, timezone


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
        cursor = users_collection.find({
            "role": "worker",
            # "$or": [
            #     {"worker_info.date_of_remove": {"$exists": False}},
            #     {"worker_info.date_of_remove": None}
            # ]
        })

        docs = await cursor.to_list(length=1000)

        return [WorkerInDB(**doc) for doc in docs]
    except Exception as e:
        print(f"Error getting workers in user_repository.py: {e}")
        return []


async def get_worker_by_id(worker_id: str) -> WorkerInDB | None:
    try:
        doc = await users_collection.find_one({
            "_id": ObjectId(worker_id),
            "role": "worker",
            # "$or": [
            #     {"worker_info.date_of_remove": {"$exists": False}},
            #     {"worker_info.date_of_remove": None}
            # ]
        })

        if doc is not None:
            return WorkerInDB(**doc)
    except Exception as e:
        print(f"Error getting worker with id {worker_id} in user_repository.py: {e}")
        return None


async def create_new_worker(worker: WorkerInDB) -> str:
    result = await users_collection.insert_one(worker.model_dump(by_alias=True))
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
        {"$set":{
            "worker_info.date_of_remove": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return result.modified_count > 0
