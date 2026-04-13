from app.data.database import db
from app.models.order import OrderInDB
from typing import List, Optional
from app.models.order import TypeTask


orders_collection = db["orders"]


async def get_by_status(task_status: TypeTask, skip: int = 0, limit: int = -1, worked_id: Optional[str] = None) -> List[OrderInDB]:
    if limit == 0:
        return []
    
    try:
        query = {"task_status": task_status}
        if worked_id is not None:
            query["stages.worked_id"] = worked_id
        
        cursor = orders_collection.find(query).skip(skip)

        docs = []
        if limit <= -1:
            async for doc in cursor:
                docs.append(doc)
        else:
            cursor = cursor.limit(limit)
            docs = await cursor.to_list(length = limit)

        return [OrderInDB(**doc) for doc in docs]
    except Exception as e:
        print(f"Error getting orders with status {TypeTask[task_status.value]}: {e}")
        return []