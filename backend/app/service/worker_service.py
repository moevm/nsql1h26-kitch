from fastapi import HTTPException, status
from app.models.user import WorkerInDB, WorkerPublic, WorkerCreate, WorkerUpdate, WorkerInfo, WorkerPosition
from app.data import user_repository as user_repo
from typing import List, Tuple
from datetime import datetime, timezone
import secrets
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def _hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def _generate_password() -> str:
    return secrets.token_urlsafe(10)


def _time_str_to_datetime(time_str: str) -> datetime:
    """Преобразует 'HH:MM' в datetime (сегодняшняя дата)"""
    now = datetime.now(timezone.utc)
    hours, minutes = map(int, time_str.split(':'))
    return now.replace(hour=hours, minute=minutes, second=0, microsecond=0)


def _calculate_experience_years(date_of_employment: datetime) -> int:
    now = datetime.now(timezone.utc)
    years = now.year - date_of_employment.year
    if now.month < date_of_employment.month or (now.month == date_of_employment.month and now.day < date_of_employment.day):
        years -= 1
    return max(0, years)


def _worker_to_public(worker_db: WorkerInDB) -> WorkerPublic:
    positions = []
    if worker_db.worker_positions:
        sorted_pos = sorted(worker_db.worker_positions, key=lambda x: x.date)
        positions = [p.position for p in sorted_pos]
    current_position = positions[-1] if positions else None

    exp_years = 0
    if worker_db.worker_info and worker_db.worker_info.date_of_employment:
        exp_years = _calculate_experience_years(worker_db.worker_info.date_of_employment)

    work_start = None
    work_end = None
    if worker_db.worker_info:
        if worker_db.worker_info.work_day_start:
            work_start = worker_db.worker_info.work_day_start
        if worker_db.worker_info.work_day_end:
            work_end = worker_db.worker_info.work_day_end

    is_active = not (worker_db.worker_info and worker_db.worker_info.date_of_remove)

    return WorkerPublic(
        id=str(worker_db.id),
        name=worker_db.username,
        email=worker_db.email,
        phone=worker_db.phone,
        date_of_birth=worker_db.worker_info.date_of_birth if worker_db.worker_info else None,
        positions=positions,
        current_position=current_position,
        experience_years=exp_years,
        work_day_start=work_start,
        work_day_end=work_end,
        comment=worker_db.worker_info.comment if worker_db.worker_info else None,
        date_of_employment = worker_db.worker_info.date_of_employment if worker_db.worker_info else None,
        date_of_remove = worker_db.worker_info.date_of_remove if is_active else None,
        is_active=is_active,
        created_at=worker_db.created_at,
        updated_at=worker_db.updated_at
    )


async def get_workers() -> List[WorkerPublic]:
    workers = await user_repo.get_workers()
    return [_worker_to_public(w) for w in workers]


async def get_worker_by_id(worker_id: str) -> WorkerPublic:
    worker = await user_repo.get_worker_by_id(worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Работник не найден или уволен")
    return _worker_to_public(worker)


async def create_new_worker(data: WorkerCreate) -> Tuple[str, str]:
    existing = await user_repo.get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email уже зарегистрирован")

    plain_password = _generate_password()
    hashed = _hash_password(plain_password)
    now = datetime.now(timezone.utc)

    worker_info = WorkerInfo(
        date_of_birth=data.date_of_birth,
        date_of_employment=now,
        date_of_remove=None,
        comment=None,
        work_day_start=data.work_day_start,
        work_day_end=data.work_day_end
    )

    worker_positions = [WorkerPosition(position=data.position, date=now)]

    worker_in_db = WorkerInDB(
        username=data.name,
        email=data.email,
        phone=None,
        hashed_password=hashed,
        created_at=now,
        updated_at=now,
        worker_info=worker_info,
        worker_positions=worker_positions
    )

    worker_id = await user_repo.create_new_worker(worker_in_db)
    return worker_id, plain_password


async def edit_worker_by_id(worker_id: str, update_data: WorkerUpdate) -> dict:
    worker = await user_repo.get_worker_by_id(worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Работник не найден или уволен")

    update_ops = {}
    if update_data.name is not None:
        update_ops["username"] = update_data.name
    if update_data.email is not None:
        existing = await user_repo.get_user_by_email(update_data.email)
        if existing and str(existing["_id"]) != worker_id:
            raise HTTPException(status_code=409, detail="Email уже используется")
        update_ops["email"] = update_data.email
    if update_data.date_of_birth is not None:
        update_ops["worker_info.date_of_birth"] = update_data.date_of_birth
    if update_data.work_day_start is not None:
        update_ops["worker_info.work_day_start"] = update_data.work_day_start
    if update_data.work_day_end is not None:
        update_ops["worker_info.work_day_end"] = update_data.work_day_end
    if update_data.comment is not None:
        update_ops["worker_info.comment"] = update_data.comment

    if update_ops:
        await user_repo.edit_worker_by_id(worker_id, {"$set": update_ops})

    if update_data.position is not None:
        current_positions = worker.worker_positions or []
        last_pos = current_positions[-1].position if current_positions else None
        if update_data.position != last_pos:
            new_pos = WorkerPosition(position=update_data.position, date=datetime.now(timezone.utc))
            await user_repo.edit_worker_by_id(worker_id, {"$push": {"worker_positions": new_pos.model_dump()}})

    return {"id": worker_id, "message": "Профиль работника обновлён"}


async def delete_worker_by_id(worker_id: str) -> dict:
    worker = await user_repo.get_worker_by_id(worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Работник не найден или уже уволен")

    success = await user_repo.delete_worker_by_id(worker_id)
    if not success:
        raise HTTPException(status_code=500, detail="Не удалось уволить работника")
    return {"id": worker_id, "message": "Работник уволен"}