from fastapi import APIRouter
from app.models.design import Design
from app.service import design_service
from typing import List

router = APIRouter(prefix="/api", tags=["designs"])

@router.get("/designs", response_model=List[Design])
async def get_designs():
    return await design_service.get_all_designs()

@router.get("/designs/types", response_model=List[dict])
async def get_design_types():
    return await design_service.get_design_types()

@router.get("/designs/{design_id}", response_model=Design)
async def get_design(design_id: str):
    return await design_service.get_design_by_id(design_id)
