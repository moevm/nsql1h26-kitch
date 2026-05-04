from app.models.design import DesignInDB
from app.data.database import db
from bson import ObjectId
from datetime import datetime, timezone
from typing import List, Dict, Any


designs_collection = db["designs"]


async def get_all() -> list[DesignInDB]:
    cursor = designs_collection.find({})
    docs = await cursor.to_list(length=100)
    return [DesignInDB(**doc) for doc in docs]


async def get_by_id(id: str) -> DesignInDB | None:
    if not ObjectId.is_valid(id):
        return None
    doc = await designs_collection.find_one({"_id": ObjectId(id)})
    if doc is None:
        return None
    return DesignInDB(**doc)


async def get_design_types() -> List[dict]:
    pipeline = [
        {
            "$group": {
                "_id": "$type",
                "type_price": {"$first": "$design_price"},
                "count": {"$sum": 1},
            }
        },
        {"$project": {"type": "$_id", "type_price": 1, "count": 1, "_id": 0}},
        {"$sort": {"type": 1}},
    ]

    cursor = designs_collection.aggregate(pipeline)
    types = await cursor.to_list(length=50)
    return types
