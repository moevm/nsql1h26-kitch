from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import date

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

router = APIRouter(prefix="/api/finance", tags=["finance"])


@router.get(
    "/dashboard",
    response_model=FinanceDashboardResponse,
    summary="Получить данные для финансового дашборда",
    description="""
    Возвращает ключевые финансовые показатели:
    - Выручка, прибыль, количество заказов, средний чек
    - Графики динамики выручки (день/неделя/месяц/год)
    - Разбивка по периодам

    Доступно только для администратора.
    """,
)
async def get_finance_dashboard(
    period_type: PeriodType = Query(default=PeriodType.MONTH, description="Тип периода (day, week, month, season, year, custom)"),
    start_date: Optional[date] = Query(default=None, description="Начальная дата для кастомного периода"),
    end_date: Optional[date] = Query(default=None, description="Конечная дата для кастомного периода"),
    current_user: dict = Depends(get_current_user_dep),
):
    if current_user["role"] != "admin":
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только администратор может просматривать финансовую статистику",
        )

    return await get_finance_dashboard_data(period_type, start_date, end_date)


@router.get(
    "/summary",
    response_model=FinanceSummary,
    summary="Получить финансовую сводку",
    description="Возвращает сводную финансовую информацию за указанный период",
)
async def get_finance_summary_endpoint(
    period_type: PeriodType = Query(default=PeriodType.MONTH, description="Тип периода"),
    start_date: Optional[date] = Query(default=None, description="Начальная дата"),
    end_date: Optional[date] = Query(default=None, description="Конечная дата"),
    current_user: dict = Depends(get_current_user_dep),
):
    if current_user["role"] != "admin":
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только администратор может просматривать финансовую статистику",
        )

    return await get_finance_summary(period_type, start_date, end_date)


@router.get(
    "/revenue-breakdown",
    response_model=list[RevenueByPeriod],
    summary="Получить разбивку выручки по периодам",
    description="Возвращает детальную разбивку выручки по дням/неделям/месяцам/годам",
)
async def get_revenue_breakdown_endpoint(
    period_type: PeriodType = Query(default=PeriodType.MONTH, description="Тип периода для группировки"),
    start_date: Optional[date] = Query(default=None, description="Начальная дата"),
    end_date: Optional[date] = Query(default=None, description="Конечная дата"),
    current_user: dict = Depends(get_current_user_dep),
):
    if current_user["role"] != "admin":
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только администратор может просматривать финансовую статистику",
        )

    return await get_revenue_breakdown(period_type, start_date, end_date)


@router.get(
    "/detailed",
    response_model=DetailedFinanceResponse,
    summary="Получить детальную финансовую статистику",
    description="""
    Возвращает расширенную финансовую статистику:
    - Статистика по заказам
    - Выручка по типам кухонь и материалам
    - Затраты
    - Маржинальность
    - Топ продуктов
    """,
)
async def get_detailed_finance_stats_endpoint(
    period_type: PeriodType = Query(default=PeriodType.MONTH, description="Тип периода"),
    start_date: Optional[date] = Query(default=None, description="Начальная дата"),
    end_date: Optional[date] = Query(default=None, description="Конечная дата"),
    current_user: dict = Depends(get_current_user_dep),
):
    if current_user["role"] != "admin":
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только администратор может просматривать финансовую статистику",
        )

    return await get_detailed_finance_stats(period_type, start_date, end_date)
