from app.models.material import MaterialInDB
from app.data.database import db
from bson import ObjectId
from datetime import datetime, timezone
from typing import List, Dict, Any


materials_collection = db["materials"]


async def get_all() -> list[MaterialInDB]:
    cursor = materials_collection.find({})
    docs = await cursor.to_list(length=100)
    return [MaterialInDB(**doc) for doc in docs]


async def get_by_id(id: str) -> MaterialInDB | None:
    doc = await materials_collection.find_one({"_id": ObjectId(id)})
    if doc is None:
        return None
    return MaterialInDB(**doc)


async def update(id: str, data: dict) -> bool:
    data["updated_at"] = datetime.now(timezone.utc)
    result = await materials_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
    return result.modified_count > 0


async def get_by_name(name: str):
    doc = await materials_collection.find_one({"name": name})
    if doc:
        from app.models.material import MaterialInDB

        doc["id"] = str(doc["_id"])
        return MaterialInDB(**doc)
    return None
