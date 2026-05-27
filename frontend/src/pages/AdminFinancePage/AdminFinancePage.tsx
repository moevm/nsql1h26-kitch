import React, { useState, useMemo } from 'react';
import { Container, Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useFinanceDashboard } from '../../hooks/useFinance';
import { PeriodSelector } from './PeriodSelector';
import { MetricCard } from './MetricCard';
import { RevenueChart } from './RevenueChart';
import type { PeriodType, RevenueByPeriod } from '../../api/finance';

export const AdminFinancePage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  const startDate = customStartDate?.toISOString().split('T')[0];
  const endDate = customEndDate?.toISOString().split('T')[0];

  const { data, isLoading, error, refetch } = useFinanceDashboard(
    periodType,
    periodType === 'custom' ? startDate : undefined,
    periodType === 'custom' ? endDate : undefined
  );

  React.useEffect(() => {
    refetch();
  }, [periodType, customStartDate, customEndDate, refetch]);

  // Умный выбор данных для графиков в зависимости от периода
  const getChartData = useMemo(() => {
    if (!data) return { revenueData: [], profitData: [], ordersData: [] };

    let breakdown: RevenueByPeriod[] = [];
    let groupingLabel = '';

    const start = customStartDate;
    const end = customEndDate;

    // Вычисляем количество дней для кастомного периода
    let daysDiff = 0;
    if (periodType === 'custom' && start && end) {
      daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    switch (periodType) {
      case 'day':
        breakdown = data.daily_breakdown;
        groupingLabel = 'часам';
        break;

      case 'week':
        breakdown = data.daily_breakdown;
        groupingLabel = 'дням';
        break;

      case 'month':
        // Для месяца показываем по неделям (если есть) или по дням
        if (data.weekly_breakdown && data.weekly_breakdown.length > 1) {
          breakdown = data.weekly_breakdown;
          groupingLabel = 'неделям';
        } else if (data.daily_breakdown && data.daily_breakdown.length > 1) {
          breakdown = data.daily_breakdown;
          groupingLabel = 'дням';
        } else {
          breakdown = data.monthly_breakdown;
          groupingLabel = 'месяцам';
        }
        break;

      case 'season':
        // Сезон - показываем по месяцам
        breakdown = data.monthly_breakdown;
        groupingLabel = 'месяцам';
        break;

      case 'year':
        // Год - показываем по месяцам
        breakdown = data.monthly_breakdown;
        groupingLabel = 'месяцам';
        break;

      case 'custom':
        // Кастомный период - умный выбор
        if (daysDiff <= 7) {
          breakdown = data.daily_breakdown;
          groupingLabel = 'дням';
        } else if (daysDiff <= 60) {
          breakdown = data.weekly_breakdown;
          groupingLabel = 'неделям';
        } else {
          breakdown = data.monthly_breakdown;
          groupingLabel = 'месяцам';
        }
        break;

      default:
        breakdown = data.daily_breakdown;
        groupingLabel = 'дням';
    }

    // Если выбранный breakdown пустой, пробуем альтернативные варианты
    if (!breakdown || breakdown.length === 0) {
      if (data.monthly_breakdown && data.monthly_breakdown.length > 0) {
        breakdown = data.monthly_breakdown;
        groupingLabel = 'месяцам';
      } else if (data.weekly_breakdown && data.weekly_breakdown.length > 0) {
        breakdown = data.weekly_breakdown;
        groupingLabel = 'неделям';
      } else if (data.daily_breakdown && data.daily_breakdown.length > 0) {
        breakdown = data.daily_breakdown;
        groupingLabel = 'дням';
      }
    }

    const revenueData = breakdown.map((item: RevenueByPeriod) => ({
      period: item.period,
      value: item.revenue,
    }));

    const profitData = breakdown.map((item: RevenueByPeriod) => ({
      period: item.period,
      value: item.profit,
    }));

    const ordersData = breakdown.map((item: RevenueByPeriod) => ({
      period: item.period,
      value: item.order_count,
    }));

    return { revenueData, profitData, ordersData, groupingLabel, pointsCount: breakdown.length };
  }, [data, periodType, customStartDate, customEndDate]);

  if (!isAdmin) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Доступ запрещен. Только для администраторов.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Ошибка загрузки: {(error as Error).message}
        </Alert>
      </Container>
    );
  }

  const summary = data?.summary;
  const margin = summary?.total_revenue && summary?.total_profit
    ? Math.round((summary.total_profit / summary.total_revenue) * 100)
    : 0;

  const { revenueData, profitData, ordersData} = getChartData;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <PeriodSelector
          periodType={periodType}
          onPeriodTypeChange={setPeriodType}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomDateChange={(start, end) => {
            setCustomStartDate(start);
            setCustomEndDate(end);
          }}
        />
      </Box>

      {/* Информация о группировке данных */}
      {/* <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          📊 Данные сгруппированы по: <strong>{groupingLabel}</strong> • {pointsCount} точек на графике
        </Typography>
        {pointsCount === 1 && (
          <Typography variant="caption" color="warning.main">
            ⚠️ Для выбранного периода недостаточно данных для построения графика
          </Typography>
        )}
      </Box> */}

      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <RevenueChart
          data={revenueData}
          title="Выручка"
          color="#000000"
          valuePrefix="₽ "
        />
        <RevenueChart
          data={profitData}
          title="Прибыль"
          color="#000000"
          valuePrefix="₽ "
        />
        <RevenueChart
          data={ordersData}
          title="Количество заказов"
          color="#000000"
          valueSuffix=" шт"
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard
            title="Выручка"
            value={summary?.total_revenue || 0}
            prefix="₽ "
            color="#000000"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard
            title="Прибыль"
            value={summary?.total_profit || 0}
            prefix="₽ "
            color="#000000"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard
            title="Заказов"
            value={summary?.total_orders || 0}
            suffix=" шт"
            color="#000000"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard
            title="Средний чек"
            value={Math.round(summary?.average_check || 0)}
            prefix="₽ "
            color="#000000"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard
            title="Маржинальность"
            value={margin}
            suffix="%"
            color="#000000"
          />
        </Box>
      </Box>
    </Container>
  );
};
