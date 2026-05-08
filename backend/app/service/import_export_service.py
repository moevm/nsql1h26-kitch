from fastapi import HTTPException, status
from app.data.import_export_repository import *
from typing import Dict, Any, List


COLLECTIONS = [
    "designs",
    "materials",
    "orders",
    "users"
]


async def import_all_data(data: Dict[str, Any]) -> dict:
    """
    Импортирует все данные из JSON в базу данных, доступ только для админа
    """
    result = {}
    for collection_name in COLLECTIONS:
        flag = await import_collection(collection_name, data.get(collection_name, []))
        result[collection_name] = f"{collection_name}: успешный импорт" if flag else f"{collection_name}: ошибка импорта"

    return result


async def export_all_data() -> Dict[str, Any]:
    """
    Экспортирует все данные в JSON из базы данных, доступ только для админа
    """
    result = {}
    for collection_name in COLLECTIONS:
        data = await export_collection(collection_name)
        result[collection_name] = data
    
    return result