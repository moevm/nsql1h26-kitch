from bson import ObjectId
from app.data.database import db
from app.models.order import OrderInDB
from datetime import datetime, timezone
from typing import List, Optional

orders_collection = db["orders"]


async def get_by_id(order_id: str) -> Optional[OrderInDB]:
    try:
        doc = await orders_collection.find_one({"_id": ObjectId(order_id)})
        if doc:
            return OrderInDB(**doc)
        return None
    except:
        return None


async def get_by_client_id(client_id: str) -> List[OrderInDB]:
    try:
        cursor = orders_collection.find({"client.client_id": client_id})
        docs = await cursor.to_list(length=100)
        return [OrderInDB(**doc) for doc in docs]
    except Exception as e:
        print(f"Error getting orders for client {client_id}: {e}")
        return []


async def get_all() -> List[OrderInDB]:
    cursor = orders_collection.find({})
    docs = await cursor.to_list(length=100)
    return [OrderInDB(**doc) for doc in docs]


async def create(order: OrderInDB) -> str:
    doc = order.model_dump(by_alias=True)
    result = await orders_collection.insert_one(doc)
    return str(result.inserted_id)


async def update(order_id: str, data: dict) -> bool:
    data["updated_at"] = datetime.now(timezone.utc)
    result = await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": data}
    )
    return result.modified_count > 0


async def delete(order_id: str) -> bool:
    result = await orders_collection.delete_one({"_id": ObjectId(order_id)})
    return result.deleted_count > 0


async def update_stage(order_id: str, stage_index: int, stage_data: dict) -> bool:
    result = await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {f"stages.{stage_index}": stage_data, "updated_at": datetime.now(timezone.utc)}}
    )
    return result.modified_count > 0
