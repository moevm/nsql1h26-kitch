from fastapi import APIRouter
from app.models.material import Material
from app.service import material_service

router = APIRouter(prefix="/api", tags=["materials"])

@router.get("/materials", response_model=list[Material])
async def get_materials():
    return await material_service.get_all_materials()

@router.get("/materials/{material_id}", response_model=Material)
async def get_material(material_id: str):
    return await material_service.get_material_by_id(material_id)
