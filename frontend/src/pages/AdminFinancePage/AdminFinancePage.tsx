import React, { useState } from 'react';
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

  let breakdown: RevenueByPeriod[] = [];
  if (data) {
    switch (periodType) {
      case 'day':
        breakdown = data.daily_breakdown || [];
        break;
      case 'week':
        breakdown = data.weekly_breakdown || [];
        break;
      case 'month':
        breakdown = data.monthly_breakdown || [];
        break;
      case 'year':
        breakdown = data.yearly_breakdown || [];
        break;
      default:
        breakdown = data.monthly_breakdown || [];
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

  const margin = summary?.total_revenue && summary?.total_profit
    ? Math.round((summary.total_profit / summary.total_revenue) * 100)
    : 0;

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

      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <RevenueChart
          data={revenueData}
          title="Выручка"
          color="#1976d2"
          valuePrefix="₽ "
        />
        <RevenueChart
          data={profitData}
          title="Прибыль"
          color="#4caf50"
          valuePrefix="₽ "
        />
        <RevenueChart
          data={ordersData}
          title="Количество заказов"
          color="#ff9800"
          valueSuffix=" шт"
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard
            title="Выручка"
            value={summary?.total_revenue || 0}
            prefix="₽ "
            color="#1976d2"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard
            title="Прибыль"
            value={summary?.total_profit || 0}
            prefix="₽ "
            color="#4caf50"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard
            title="Заказов"
            value={summary?.total_orders || 0}
            suffix=" шт"
            color="#ff9800"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard
            title="Средний чек"
            value={Math.round(summary?.average_check || 0)}
            prefix="₽ "
            color="#9c27b0"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard
            title="Маржинальность"
            value={margin}
            suffix="%"
            color="#4caf50"
          />
        </Box>
      </Box>
    </Container>
  );
};
