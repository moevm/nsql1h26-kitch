from fastapi import HTTPException, status
from app.models.material import Material, MaterialUpdate
from app.data import material_data as material_repo
from typing import List


async def get_all_materials() -> List[Material]:
    try:
        materials_db = await material_repo.get_all()
        return [Material(**m.model_dump()) for m in materials_db]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении материалов: {str(e)}",
        )


async def get_material_by_id(material_id: str) -> Material:
    material_db = await material_repo.get_by_id(material_id)

    if material_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Материал с ID {material_id} не найден",
        )

    return Material(**material_db.model_dump())


async def update_material(
    material_id: str, material_update: MaterialUpdate
) -> Material:
    await get_material_by_id(material_id)

    update_data = material_update.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Нет данных для обновления"
        )

    if update_data.get("remain") is not None and update_data["remain"] < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Остаток материала не может быть отрицательным",
        )

    if update_data.get("cost") is not None and update_data["cost"] < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Цена материала не может быть отрицательной",
        )

    success = await material_repo.update(material_id, update_data)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось обновить материал",
        )

    updated_db = await material_repo.get_by_id(material_id)
    return Material(**updated_db.model_dump())
