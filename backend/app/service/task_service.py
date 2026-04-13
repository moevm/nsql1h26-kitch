from app.models.order import Order
from app.data import task_repository as task_repo
from typing import List
from app.models.order import TypeTask



async def get_tasks_by_status(tusk_status: TypeTask, skip: int, limit: int, worker_id: str) -> List[Order]:
    orders_db = await task_repo.get_by_status(tusk_status, skip, limit, worker_id)
    return [Order(**order.model_dump()) for order in orders_db]
