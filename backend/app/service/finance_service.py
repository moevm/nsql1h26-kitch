from datetime import datetime, date, timedelta, timezone
from typing import List, Optional, Tuple
from fastapi import HTTPException, status

from app.data.database import db
from app.models.finance import (
    FinanceSummary,
    RevenueByPeriod,
    PeriodType,
    PeriodFilter,
    FinanceDashboardResponse,
    DetailedFinanceResponse,
    OrderStats,
    RevenueStats,
    CostStats,
    ProfitMarginStats,
)

orders_collection = db["orders"]


def _get_date_range(
    period_type: PeriodType, start_date: Optional[date] = None, end_date: Optional[date] = None
) -> Tuple[date, date]:
    """Возвращает кортеж (start_date, end_date) на основе типа периода"""
    today = date.today()

    if period_type == PeriodType.DAY:
        if start_date:
            return start_date, start_date
        return today, today

    elif period_type == PeriodType.WEEK:
        if start_date:
            week_start = start_date
            week_end = week_start + timedelta(days=6)
            return week_start, week_end
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        return week_start, week_end

    elif period_type == PeriodType.MONTH:
        if start_date:
            month_start = start_date.replace(day=1)
            if month_start.month == 12:
                next_month = month_start.replace(year=month_start.year + 1, month=1, day=1)
            else:
                next_month = month_start.replace(month=month_start.month + 1, day=1)
            month_end = next_month - timedelta(days=1)
            return month_start, month_end
        month_start = today.replace(day=1)
        if month_start.month == 12:
            next_month = month_start.replace(year=month_start.year + 1, month=1, day=1)
        else:
            next_month = month_start.replace(month=month_start.month + 1, day=1)
        month_end = next_month - timedelta(days=1)
        return month_start, month_end

    elif period_type == PeriodType.SEASON:
        if start_date:
            season_start = start_date
            if season_start.month in [12, 1, 2]:
                if season_start.month == 12:
                    season_end = date(season_start.year + 1, 2, 28)
                else:
                    season_end = date(season_start.year, 2, 28)
            elif season_start.month in [3, 4, 5]:
                season_end = date(season_start.year, 5, 31)
            elif season_start.month in [6, 7, 8]:
                season_end = date(season_start.year, 8, 31)
            else:
                season_end = date(season_start.year, 11, 30)
            return season_start, season_end

        if today.month in [12, 1, 2]:
            if today.month == 12:
                season_start = date(today.year, 12, 1)
                season_end = date(today.year + 1, 2, 28)
            else:
                season_start = date(today.year - 1, 12, 1)
                season_end = date(today.year, 2, 28)
        elif today.month in [3, 4, 5]:
            season_start = date(today.year, 3, 1)
            season_end = date(today.year, 5, 31)
        elif today.month in [6, 7, 8]:
            season_start = date(today.year, 6, 1)
            season_end = date(today.year, 8, 31)
        else:
            season_start = date(today.year, 9, 1)
            season_end = date(today.year, 11, 30)
        return season_start, season_end

    elif period_type == PeriodType.YEAR:
        if start_date:
            year_start = date(start_date.year, 1, 1)
            year_end = date(start_date.year, 12, 31)
            return year_start, year_end
        year_start = date(today.year, 1, 1)
        year_end = date(today.year, 12, 31)
        return year_start, year_end

    elif period_type == PeriodType.CUSTOM:
        if not start_date or not end_date:
            return today - timedelta(days=30), today
        return start_date, end_date

    return today, today


async def get_finance_summary(
    period_type: PeriodType,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> FinanceSummary:
    """Получение финансовой сводки за период"""

    start, end = _get_date_range(period_type, start_date, end_date)

    start_datetime = datetime.combine(start, datetime.min.time())
    end_datetime = datetime.combine(end + timedelta(days=1), datetime.min.time())

    # Получаем все заказы за период
    cursor = orders_collection.find({
        "created_at": {"$gte": start_datetime, "$lt": end_datetime},
    })
    orders = await cursor.to_list(length=1000)

    total_revenue = 0
    total_material_cost = 0
    total_delivery_fee = 0
    total_type_price = 0
    total_comment_fee = 0
    total_orders = len(orders)

    for order in orders:
        pricing = order.get("pricing", {})
        total_revenue += pricing.get("total_price", 0)
        total_material_cost += pricing.get("material_price", 0)
        total_delivery_fee += pricing.get("delivery_price", 0)
        total_type_price += pricing.get("type_price", 0)
        total_comment_fee += pricing.get("comment_price", 0)

    total_profit = total_revenue - total_material_cost
    average_check = total_revenue / total_orders if total_orders > 0 else 0

    return FinanceSummary(
        period_type=period_type,
        start_date=start,
        end_date=end,
        total_revenue=total_revenue,
        total_profit=total_profit,
        total_orders=total_orders,
        average_check=average_check,
        total_material_cost=total_material_cost,
        total_delivery_fee=total_delivery_fee,
        total_type_price=total_type_price,
        total_comment_fee=total_comment_fee,
    )


async def get_revenue_breakdown(
    period_type: PeriodType,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> List[RevenueByPeriod]:
    """Получение разбивки выручки по периодам"""

    start, end = _get_date_range(period_type, start_date, end_date)
    start_datetime = datetime.combine(start, datetime.min.time())
    end_datetime = datetime.combine(end + timedelta(days=1), datetime.min.time())

    print(f"DEBUG: get_revenue_breakdown - period_type={period_type}, start={start}, end={end}")

    # Получаем все заказы за период
    cursor = orders_collection.find({
        "created_at": {"$gte": start_datetime, "$lt": end_datetime},
    })
    orders = await cursor.to_list(length=10000)

    print(f"DEBUG: Found {len(orders)} orders in period")

    if not orders:
        return []

    # Группировка в Python
    groups = {}

    for order in orders:
        created_at = order.get("created_at")
        if not created_at:
            continue

        # Определяем ключ группировки
        if period_type == PeriodType.DAY:
            key = created_at.strftime("%Y-%m-%d")
        elif period_type == PeriodType.WEEK:
            year, week, _ = created_at.isocalendar()
            key = f"{year}-W{week:02d}"
        elif period_type == PeriodType.MONTH:
            key = created_at.strftime("%Y-%m")
        elif period_type == PeriodType.YEAR:
            key = created_at.strftime("%Y")
        else:
            key = created_at.strftime("%Y-%m-%d")

        if key not in groups:
            groups[key] = {
                "revenue": 0,
                "material_cost": 0,
                "order_count": 0
            }

        pricing = order.get("pricing", {})
        groups[key]["revenue"] += pricing.get("total_price", 0)
        groups[key]["material_cost"] += pricing.get("material_price", 0)
        groups[key]["order_count"] += 1

    print(f"DEBUG: Groups found: {list(groups.keys())}")

    # Преобразуем в список
    results = []
    for key, data in sorted(groups.items()):
        results.append(RevenueByPeriod(
            period=key,
            revenue=data["revenue"],
            profit=data["revenue"] - data["material_cost"],
            order_count=data["order_count"],
            average_check=data["revenue"] / data["order_count"] if data["order_count"] > 0 else 0,
        ))

    return results


async def get_detailed_finance_stats(
    period_type: PeriodType,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> DetailedFinanceResponse:
    """Получение детальной финансовой статистики"""

    start, end = _get_date_range(period_type, start_date, end_date)
    start_datetime = datetime.combine(start, datetime.min.time())
    end_datetime = datetime.combine(end + timedelta(days=1), datetime.min.time())

    cursor = orders_collection.find({
        "created_at": {"$gte": start_datetime, "$lt": end_datetime},
    })
    orders = await cursor.to_list(length=1000)

    if not orders:
        return DetailedFinanceResponse(
            period=PeriodFilter(period_type=period_type, start_date=start, end_date=end),
            date_range={"start": start.isoformat(), "end": end.isoformat()},
            orders=OrderStats(
                total_orders=0,
                completed_orders=0,
                cancelled_orders=0,
                in_progress_orders=0,
                completion_rate=0,
            ),
            revenue=RevenueStats(
                total_revenue=0,
                revenue_by_type={},
                revenue_by_material={},
                avg_order_value=0,
                max_order_value=0,
                min_order_value=0,
            ),
            costs=CostStats(
                total_material_cost=0,
                total_delivery_cost=0,
                total_comment_cost=0,
                avg_material_cost_per_order=0,
                avg_delivery_cost_per_order=0,
            ),
            profit_margin=ProfitMarginStats(
                overall_margin=0,
                margin_by_type={},
                margin_by_material={},
            ),
            top_products=[],
        )

    total_orders = len(orders)
    revenues = []
    material_costs = []
    delivery_fees = []
    comment_fees = []

    revenue_by_type = {}
    revenue_by_material = {}
    type_count = {}
    material_count = {}

    for order in orders:
        pricing = order.get("pricing", {})
        revenue = pricing.get("total_price", 0)
        material_cost = pricing.get("material_price", 0)
        delivery_fee = pricing.get("delivery_price", 0)
        comment_fee = pricing.get("comment_price", 0)

        revenues.append(revenue)
        material_costs.append(material_cost)
        delivery_fees.append(delivery_fee)
        comment_fees.append(comment_fee)

        kitchen_type = order.get("type", "Неизвестно")
        revenue_by_type[kitchen_type] = revenue_by_type.get(kitchen_type, 0) + revenue
        type_count[kitchen_type] = type_count.get(kitchen_type, 0) + 1

        material = order.get("material", "Неизвестно")
        revenue_by_material[material] = revenue_by_material.get(material, 0) + revenue
        material_count[material] = material_count.get(material, 0) + 1

    total_revenue = sum(revenues)
    total_material_cost = sum(material_costs)
    total_delivery_cost = sum(delivery_fees)
    total_comment_cost = sum(comment_fees)

    # Вычисляем маржинальность по типам
    margin_by_type = {}
    for k, v in revenue_by_type.items():
        if v > 0:
            margin_by_type[k] = 50  # заглушка

    # Вычисляем маржинальность по материалам
    margin_by_material = {}
    for k, v in revenue_by_material.items():
        if v > 0:
            margin_by_material[k] = 50  # заглушка

    top_products = sorted(
        [{"name": k, "count": v, "revenue": revenue_by_type.get(k, 0)}
         for k, v in type_count.items()],
        key=lambda x: x["count"],
        reverse=True
    )[:5]

    return DetailedFinanceResponse(
        period=PeriodFilter(period_type=period_type, start_date=start, end_date=end),
        date_range={"start": start.isoformat(), "end": end.isoformat()},
        orders=OrderStats(
            total_orders=total_orders,
            completed_orders=total_orders,
            cancelled_orders=0,
            in_progress_orders=0,
            completion_rate=100.0 if total_orders > 0 else 0,
        ),
        revenue=RevenueStats(
            total_revenue=total_revenue,
            revenue_by_type=revenue_by_type,
            revenue_by_material=revenue_by_material,
            avg_order_value=total_revenue / total_orders if total_orders > 0 else 0,
            max_order_value=max(revenues) if revenues else 0,
            min_order_value=min(revenues) if revenues else 0,
        ),
        costs=CostStats(
            total_material_cost=total_material_cost,
            total_delivery_cost=total_delivery_cost,
            total_comment_cost=total_comment_cost,
            avg_material_cost_per_order=total_material_cost / total_orders if total_orders > 0 else 0,
            avg_delivery_cost_per_order=total_delivery_cost / total_orders if total_orders > 0 else 0,
        ),
        profit_margin=ProfitMarginStats(
            overall_margin=(total_revenue - total_material_cost) / total_revenue * 100 if total_revenue > 0 else 0,
            margin_by_type=margin_by_type,
            margin_by_material=margin_by_material,
        ),
        top_products=top_products,
    )


async def get_finance_dashboard_data(
    period_type: PeriodType = PeriodType.MONTH,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> FinanceDashboardResponse:
    """Получение всех данных для финансового дашборда"""

    summary = await get_finance_summary(period_type, start_date, end_date)

    print(f"DEBUG: Dashboard summary period: {summary.start_date} to {summary.end_date}")

    # Получаем разбивки для каждого типа периода, НО используем полные даты года
    if period_type == PeriodType.YEAR:
        # Для года показываем разбивку по месяцам
        year_start = date(summary.start_date.year, 1, 1)
        year_end = date(summary.start_date.year, 12, 31)

        monthly_breakdown = await get_revenue_breakdown(PeriodType.MONTH, year_start, year_end)
        yearly_breakdown = await get_revenue_breakdown(PeriodType.YEAR, year_start, year_end)

        return FinanceDashboardResponse(
            summary=summary,
            daily_breakdown=[],
            weekly_breakdown=[],
            monthly_breakdown=monthly_breakdown,
            yearly_breakdown=yearly_breakdown,
        )
    else:
        daily_breakdown = await get_revenue_breakdown(PeriodType.DAY, summary.start_date, summary.end_date)
        weekly_breakdown = await get_revenue_breakdown(PeriodType.WEEK, summary.start_date, summary.end_date)
        monthly_breakdown = await get_revenue_breakdown(PeriodType.MONTH, summary.start_date, summary.end_date)
        yearly_breakdown = await get_revenue_breakdown(PeriodType.YEAR, summary.start_date, summary.end_date)

        return FinanceDashboardResponse(
            summary=summary,
            daily_breakdown=daily_breakdown,
            weekly_breakdown=weekly_breakdown,
            monthly_breakdown=monthly_breakdown,
            yearly_breakdown=yearly_breakdown,
        )
