from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import Response
from bson import json_util
from typing import Dict, Any
from app.service.auth_service import get_current_user_dep
from app.service.import_export_service import import_all_data, export_all_data


router = APIRouter(prefix="/api", tags=["import_export"])


@router.post(
    "/import_all_data",
    response_model=dict,
    summary="Массовый импорт в базы данных",
    description="""
    Импортирует все данные из JSON в базу данных, доступ только для админа
    """
)
async def import_all_data_in_db(
        file: UploadFile = File(...),
        current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Только админы могут делать массовый импорт")
    
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Файл должен иметь расширение JSON")
    
    try:
        contents = await file.read()
        data = json_util.loads(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Неверный формат JSON: {e}")
    
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Корневой элемент JSON должен быть объектом")

    message = await import_all_data(data)
    return message


@router.get(
    "/export_all_data",
    response_model=Dict[str, Any],
    summary="Массовый экспорт из базы данных",
    description="""
    Экспортирует все данные в JSON из базы данных, доступ только для админа
    """
)
async def export_all_data_from_db(
    current_user: dict = Depends(get_current_user_dep)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Только админы могут делать массовый экспорт")
    data = await export_all_data()
    json_str = json_util.dumps(data, ensure_ascii=False, indent=2)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=export.json"}
    )
