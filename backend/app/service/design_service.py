from fastapi import HTTPException, status
from app.models.design import Design, DesignInDB
from app.data import design_data as design_repo
from typing import List

async def get_all_designs() -> List[Design]:
    try:
        designs_db = await design_repo.get_all()
        return [Design(**d.model_dump()) for d in designs_db]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении дизайнов: {str(e)}"
        )

async def get_design_by_id(design_id: str) -> Design:
    design_db = await design_repo.get_by_id(design_id)
    if design_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Дизайн с ID {design_id} не найден"
        )
    return Design(**design_db.model_dump())

async def get_design_types() -> List[dict]:
    try:
        return await design_repo.get_design_types()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении типов дизайнов: {str(e)}"
        )
