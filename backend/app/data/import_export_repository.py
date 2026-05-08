from app.data.database import db
from bson import ObjectId
from typing import List, Dict, Any


async def import_collection(collection_name: str, data: List[Dict[str, Any]]) -> bool:
    try:
        await db[collection_name].delete_many({})
        
        if data:
            for doc in data:
                if "_id" in doc and isinstance(doc["_id"], str) and ObjectId.is_valid(doc["_id"]):
                    doc["_id"] = ObjectId(doc["_id"])
                else:
                    doc["_id"] = ObjectId()

            await db[collection_name].insert_many(data)

        return True
    except Exception as e:
        print(f"Error import {collection_name}: {e}")
        return False


async def export_collection(collection_name: str) -> List[dict]:
    try:
        cursor = db[collection_name].find({})
        docs = await cursor.to_list(length=None)
        return docs
    except Exception as e:
        print(f"Error export {collection_name}: {e}")
        return []
