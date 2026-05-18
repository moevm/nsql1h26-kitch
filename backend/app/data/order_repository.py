from bson import ObjectId
from app.data.database import db
from app.models.order import OrderInDB, TypeStage, TypeStatus, TypeTask
from datetime import datetime, timezone
from typing import List, Optional
from app.models.design import TypeDesign

SORT_FIELD_MAP = {
    "created_at": "created_at",
    "name_design": "name_design",
    "type": "type",
    "material": "material",
    "total_price": "pricing.total_price",
    "stage": "last_stage_status",
    "deadline": "last_stage_deadline",
}


orders_collection = db["orders"]



async def push_stage(order_id: str, stage: dict) -> bool:
    now = datetime.now(timezone.utc)
    result = await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$push": {"stages": stage},
            "$set": {"updated_at": now}
        }
    )
    return result.modified_count > 0


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
    if "_id" in doc and isinstance(doc["_id"], str):
        doc["_id"] = ObjectId(doc["_id"])
    result = await orders_collection.insert_one(doc)
    return str(result.inserted_id)


async def cancel(order_id: str) -> bool:
    """Отменить заказ (изменить статус)"""
    now = datetime.now(timezone.utc)

    cancel_order = {
        "name_stage": TypeStage.Canceled.value,  # строка
        "worker_id": "",
        "status": TypeStatus.Canceled.value,  # строка
        "task_status": TypeTask.Canceled.value,  # строка
        "times": {
            "deadline": now,
            "start": now,
            "end": now,
            "est_time": 0,
            "spent": 0,
            "expired_time": 0,
        },
    }

    result = await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$push": {"stages": cancel_order}, "$set": {"updated_at": now}},
    )
    return result.modified_count > 0


async def get_filtered_orders_for_client(
    client_id: str,
    name_design: str,
    type: TypeDesign,
    material: str,
    stage: TypeStage,
    address: str,
    comment: str,
    min_price: int,
    max_price: int,
    from_created: Optional[datetime],
    to_created: Optional[datetime],
    from_deadline: Optional[datetime],
    to_deadline: Optional[datetime],
    sort_by: str,
    sort_direction: int,
    skip: int,
    limit: int,
) -> List[OrderInDB]:
    if limit == 0:
        return []

    try:
        filter_query = {"client.client_id": client_id}

        if name_design is not None:
            filter_query["name_design"] = {"$regex": name_design, "$options": "i"}

        if material is not None:
            filter_query["material"] = {"$regex": material, "$options": "i"}

        if comment is not None:
            filter_query["comment"] = {"$regex": comment, "$options": "i"}

        if address is not None:
            filter_query["delivery.address"] = {"$regex": address, "$options": "i"}

        if type is not None:
            filter_query["type"] = type.value

        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        if price_filter:
            filter_query["pricing.total_price"] = price_filter

        created_filter = {}
        if from_created is not None:
            created_filter["$gte"] = from_created
        if to_created is not None:
            created_filter["$lte"] = to_created
        if created_filter:
            filter_query["created_at"] = created_filter

        pipeline = [
            {"$match": filter_query},
            {
                "$addFields": {
                    "last_stage_status": {"$arrayElemAt": ["$stages.name_stage", -1]},
                    "last_stage_deadline": {
                        "$arrayElemAt": ["$stages.times.deadline", -1]
                    },
                }
            },
        ]

        if stage is not None:
            pipeline.append({"$match": {"last_stage_status": stage.value}})


        deadline_filter = {}
        if from_deadline is not None:
            deadline_filter["$gte"] = from_deadline
        if to_deadline is not None:
            deadline_filter["$lte"] = to_deadline
        if deadline_filter:
            pipeline.append({
                "$match": {
                    "$and":[
                        {"last_stage_deadline": deadline_filter}
                    ]
                }
            })

        sort_field = SORT_FIELD_MAP.get(sort_by, "created_at")
        pipeline.append({"$sort": {sort_field: sort_direction}})

        if skip > 0:
            pipeline.append({"$skip": skip})

        if limit > 0:
            pipeline.append({"$limit": limit})
        else:
            pipeline.append({"$limit": 1000})

        cursor = orders_collection.aggregate(pipeline)
        docs = await cursor.to_list(length=limit if limit > 0 else 1000)

        result = []
        for doc in docs:
            doc["id"] = str(doc["_id"])
            doc.pop("last_stage_status", None)
            doc.pop("last_stage_deadline", None)
            result.append(OrderInDB(**doc))

        return result

    except Exception as e:
        print(
            f"Error getting orders in order_repository.get_filtered_orders_for_client: {e}"
        )
        return []
    

async def get_count_orders(user_id: str, role: str) -> int:
    try:
        if role == "admin":
            return await orders_collection.count_documents({})
        if role == "worker":
            return await orders_collection.count_documents({"stages.worker_id": user_id})
        return await orders_collection.count_documents({"client.client_id": user_id})
    except Exception as e:
        print(f"Error count orders in order_repository.py: {e}")
        return 0