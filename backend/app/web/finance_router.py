from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from datetime import date
from bson import ObjectId

from app.service.auth_service import get_current_user_dep
from app.service.finance_service import (
    get_finance_dashboard_data,
    get_finance_summary,
    get_revenue_breakdown,
    get_detailed_finance_stats,
)
from app.models.finance import (
    FinanceDashboardResponse,
    FinanceSummary,
    RevenueByPeriod,
    PeriodType,
    DetailedFinanceResponse,
)
from app.data.database import db

router = APIRouter(prefix="/api/finance", tags=["finance"])
orders_collection = db["orders"]
users_collection = db["users"]


@router.get(
    "/dashboard",
    response_model=FinanceDashboardResponse,
    summary="Получить данные для финансового дашборда",
)
async def get_finance_dashboard(
    period_type: PeriodType = Query(default=PeriodType.MONTH, description="Тип периода"),
    start_date: Optional[date] = Query(default=None, description="Начальная дата"),
    end_date: Optional[date] = Query(default=None, description="Конечная дата"),
    employees: Optional[str] = Query(default=None, description="Сотрудники через запятую"),
    order_types: Optional[str] = Query(default=None, description="Типы заказов через запятую"),
    positions: Optional[str] = Query(default=None, description="Позиции через запятую"),
    current_user: dict = Depends(get_current_user_dep),
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только администратор может просматривать финансовую статистику",
        )

    filters = {}
    if employees:
        filters["employees"] = employees.split(",")
    if order_types:
        filters["order_types"] = order_types.split(",")
    if positions:
        filters["positions"] = positions.split(",")

    return await get_finance_dashboard_data(period_type, start_date, end_date, filters)


@router.get("/filters", response_model=dict)
async def get_finance_filters(
    current_user: dict = Depends(get_current_user_dep),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только администратор")

    # Получаем уникальные worker_id из этапов заказов
    pipeline = [
        {"$unwind": "$stages"},
        {"$group": {"_id": "$stages.worker_id"}},
        {"$match": {"_id": {"$ne": None, "$ne": ""}}}
    ]

    worker_ids_cursor = orders_collection.aggregate(pipeline)
    worker_ids = [doc["_id"] for doc in await worker_ids_cursor.to_list(100)]

    print(f"[DEBUG] Found worker_ids: {worker_ids}")

    # Получаем имена сотрудников из коллекции users
    employees = []
    for worker_id in worker_ids:
        try:
            user = await users_collection.find_one({"_id": ObjectId(worker_id), "role": "worker"})
        except:
            user = await users_collection.find_one({"_id": worker_id, "role": "worker"})

        if user:
            name = user.get("username") or user.get("email") or worker_id
            employees.append({"id": worker_id, "name": name})
            print(f"[DEBUG] Found user: {name} with id: {worker_id}")
        else:
            employees.append({"id": worker_id, "name": f"Рабочий {worker_id[-6:]}"})
            print(f"[DEBUG] No user found for worker_id: {worker_id}")

    # Типы заказов
    order_types = await orders_collection.distinct("type")
    order_types = [t for t in order_types if t]

    # Позиции
    positions = await orders_collection.distinct("material")
    positions = [p for p in positions if p]

    print(f"[DEBUG] Returning employees count: {len(employees)}")
    print(f"[DEBUG] Returning order_types: {order_types}")
    print(f"[DEBUG] Returning positions: {positions}")

    return {
        "employees": employees,
        "orderTypes": order_types,
        "positions": positions,
    }


@router.get("/summary", response_model=FinanceSummary)
async def get_finance_summary_endpoint(
    period_type: PeriodType = Query(default=PeriodType.MONTH),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: dict = Depends(get_current_user_dep),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только администратор")
    return await get_finance_summary(period_type, start_date, end_date)


@router.get("/revenue-breakdown", response_model=list[RevenueByPeriod])
async def get_revenue_breakdown_endpoint(
    period_type: PeriodType = Query(default=PeriodType.MONTH),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: dict = Depends(get_current_user_dep),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только администратор")
    return await get_revenue_breakdown(period_type, start_date, end_date)


@router.get("/detailed", response_model=DetailedFinanceResponse)
async def get_detailed_finance_stats_endpoint(
    period_type: PeriodType = Query(default=PeriodType.MONTH),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: dict = Depends(get_current_user_dep),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только администратор")
    return await get_detailed_finance_stats(period_type, start_date, end_date)
