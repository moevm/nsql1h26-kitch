from bson import ObjectId
from app.data.database import db
from app.models.order import OrderInDB, TypeStatus
from datetime import datetime, timezone
from typing import List, Optional


orders_collection = db["orders"]


async def get_by_id(order_id: str) -> Optional[OrderInDB]:
    try:
        doc = await orders_collection.find_one({"_id": ObjectId(order_id)})
        if doc:
            doc["id"] = str(doc["_id"])
            return OrderInDB(**doc)
        return None
    except Exception as e:
        print(f"Error getting order {order_id}: {e}")
        return None


async def get_all() -> List[OrderInDB]:
    cursor = orders_collection.find({})
    docs = await cursor.to_list(length=100)
    result = []
    for doc in docs:
        doc["id"] = str(doc["_id"])
        result.append(OrderInDB(**doc))
    return result

async def get_by_client_id(client_id: str) -> List[OrderInDB]:
    try:
        cursor = orders_collection.find({"client.client_id": client_id})
        docs = await cursor.to_list(length=100)
        result = []
        for doc in docs:
            doc["id"] = str(doc["_id"])
            result.append(OrderInDB(**doc))
        return result
    except Exception as e:
        print(f"Error getting orders for client {client_id}: {e}")
        return []

async def get_by_worker_id(worker_id: str) -> List[OrderInDB]:
    cursor = orders_collection.find({"stages.worker_id": worker_id})
    docs = await cursor.to_list(length=100)
    result = []
    for doc in docs:
        doc["id"] = str(doc["_id"])
        result.append(OrderInDB(**doc))
    return result


async def create(order: OrderInDB) -> str:
    doc = order.model_dump(by_alias=True)
    result = await orders_collection.insert_one(doc)
    return str(result.inserted_id)


async def cancel(order_id: str) -> bool:
    """Отменить заказ (изменить статус)"""
    result = await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    return result.modified_count > 0
