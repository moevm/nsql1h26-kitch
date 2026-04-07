from app.models.material import MaterialInDB
from app.data.database import db
from bson import ObjectId
from datetime import datetime, timezone

async def get_all() -> list[MaterialInDB]:
    cursor = db["materials"].find({})
    docs = await cursor.to_list(length=100)
    return [MaterialInDB(**doc) for  doc in docs]

async def get_by_id(id: str) -> MaterialInDB | None:
    doc = await db["materials"].find_one({"_id": ObjectId(id)})
    if doc is None:
        return None
    return MaterialInDB(**doc)

async def update(id: str, data: dict) -> bool:
    data["updated_at"] = datetime.now(timezone.utc)
    result = await db["materials"].update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )
    return result.modified_count > 0
