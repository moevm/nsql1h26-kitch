from fastapi import HTTPException, status
from app.models.design import Design, DesignInDB
from app.data import design_data as design_repo
from typing import List


async def get_all_designs() -> List[Design]:
    try:
        designs_db = await design_repo.get_all()
        result = []
        for d in designs_db:
            design_dict = d.model_dump()
            design_dict["id"] = str(d.id)
            result.append(Design(**design_dict))
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении дизайнов: {str(e)}",
        )


async def get_design_by_id(design_id: str) -> Design:
    design_db = await design_repo.get_by_id(design_id)
    if design_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Дизайн с ID {design_id} не найден",
        )
    design_dict = design_db.model_dump()
    design_dict["id"] = str(design_db.id)
    return Design(**design_dict)


async def get_design_types() -> List[dict]:
    try:
        return await design_repo.get_design_types()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении типов дизайнов: {str(e)}",
        )
