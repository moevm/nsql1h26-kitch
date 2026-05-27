from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, date
from enum import Enum


class PeriodType(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    SEASON = "season"
    YEAR = "year"
    CUSTOM = "custom"


class RevenueByPeriod(BaseModel):
    period: str  # например "2024-01", "2024-W01", "2024-01-01"
    revenue: int  # выручка за период
    profit: int   # прибыль за период
    order_count: int  # количество заказов
    average_check: float  # средний чек


class FinanceSummary(BaseModel):
    period_type: PeriodType
    start_date: date
    end_date: date
    total_revenue: int
    total_profit: int
    total_orders: int
    average_check: float
    total_material_cost: int  # общие затраты на материалы
    total_delivery_fee: int   # общая стоимость доставки
    total_type_price: int     # общая стоимость типов кухонь
    total_comment_fee: int    # общая стоимость комментариев


class FinanceDashboardResponse(BaseModel):
    summary: FinanceSummary
    daily_breakdown: List[RevenueByPeriod]
    weekly_breakdown: List[RevenueByPeriod]
    monthly_breakdown: List[RevenueByPeriod]
    yearly_breakdown: List[RevenueByPeriod]


class PeriodFilter(BaseModel):
    period_type: PeriodType = PeriodType.MONTH
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class OrderStats(BaseModel):
    """Статистика по заказам"""
    total_orders: int
    completed_orders: int
    cancelled_orders: int
    in_progress_orders: int
    completion_rate: float  # процент выполненных заказов


class RevenueStats(BaseModel):
    """Статистика по выручке"""
    total_revenue: int
    revenue_by_type: dict  # выручка по типам кухонь
    revenue_by_material: dict  # выручка по материалам
    avg_order_value: float
    max_order_value: int
    min_order_value: int


class CostStats(BaseModel):
    """Статистика по затратам"""
    total_material_cost: int
    total_delivery_cost: int
    total_comment_cost: int
    avg_material_cost_per_order: float
    avg_delivery_cost_per_order: float


class ProfitMarginStats(BaseModel):
    """Статистика по маржинальности"""
    overall_margin: float  # общая маржинальность в %
    margin_by_type: dict  # маржинальность по типам кухонь
    margin_by_material: dict  # маржинальность по материалам


class DetailedFinanceResponse(BaseModel):
    period: PeriodFilter
    date_range: dict
    orders: OrderStats
    revenue: RevenueStats
    costs: CostStats
    profit_margin: ProfitMarginStats
    top_products: List[dict]  # топ-5 самых продаваемых типов кухонь
