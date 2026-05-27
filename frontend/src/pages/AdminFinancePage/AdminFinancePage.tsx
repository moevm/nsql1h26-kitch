import React, { useState, useMemo, useEffect } from 'react';
import {
  Container, Box, CircularProgress, Alert,
  Paper, FormControl, InputLabel, Select, MenuItem,
  Chip, OutlinedInput, Typography, Button
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useFinanceDashboard, useFinanceFilters } from '../../hooks/useFinance';
import { PeriodSelector } from './PeriodSelector';
import { MetricCard } from './MetricCard';
import { RevenueChart } from './RevenueChart';
import type { PeriodType, RevenueByPeriod } from '../../api/finance';

interface FilterState {
  employees: string[];  
  orderTypes: string[];
  positions: string[];
}

interface EmployeeOption {
  id: string;
  name: string;
}

export const AdminFinancePage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    employees: [],
    orderTypes: [],
    positions: [],
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const startDate = customStartDate?.toISOString().split('T')[0];
  const endDate = customEndDate?.toISOString().split('T')[0];

  const { data: filterOptions, isLoading: filtersLoading } = useFinanceFilters();
  const { data, isLoading, error, refetch } = useFinanceDashboard(
    periodType,
    periodType === 'custom' ? startDate : undefined,
    periodType === 'custom' ? endDate : undefined,
    filters
  );

  useEffect(() => {
    console.log('=== Фильтры изменились ===');
    console.log('filters.employees:', filters.employees);
    refetch();
  }, [periodType, customStartDate, customEndDate, filters, refetch]);

  const handleEmployeeChange = (event: any) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      employees: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleOrderTypeChange = (event: any) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      orderTypes: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handlePositionChange = (event: any) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      positions: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      employees: [],
      orderTypes: [],
      positions: [],
    });
  };

  const hasActiveFilters = filters.employees.length > 0 ||
                          filters.orderTypes.length > 0 ||
                          filters.positions.length > 0;

  // Получаем имя сотрудника по id
  const getEmployeeName = (id: string): string => {
    const employee = filterOptions?.employees?.find((e: EmployeeOption) => e.id === id);
    return employee?.name || id.slice(-8);
  };

  const getChartData = useMemo(() => {
    if (!data) return { revenueData: [], profitData: [], ordersData: [] };

    let breakdown: RevenueByPeriod[] = [];

    switch (periodType) {
      case 'day':
        breakdown = data.daily_breakdown;
        break;
      case 'week':
        breakdown = data.daily_breakdown;
        break;
      case 'month':
        if (data.weekly_breakdown && data.weekly_breakdown.length > 1) {
          breakdown = data.weekly_breakdown;
        } else if (data.daily_breakdown && data.daily_breakdown.length > 1) {
          breakdown = data.daily_breakdown;
        } else {
          breakdown = data.monthly_breakdown;
        }
        break;
      case 'season':
      case 'year':
        breakdown = data.monthly_breakdown;
        break;
      default:
        breakdown = data.daily_breakdown;
    }

    if (!breakdown || breakdown.length === 0) {
      if (data.monthly_breakdown?.length > 0) {
        breakdown = data.monthly_breakdown;
      } else if (data.weekly_breakdown?.length > 0) {
        breakdown = data.weekly_breakdown;
      } else if (data.daily_breakdown?.length > 0) {
        breakdown = data.daily_breakdown;
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

    return { revenueData, profitData, ordersData };
  }, [data, periodType]);

  if (!isAdmin) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Доступ запрещен. Только для администраторов.
        </Alert>
      </Container>
    );
  }

  if (isLoading || filtersLoading) {
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

  const { revenueData, profitData, ordersData } = getChartData;

  console.log('filterOptions:', filterOptions);
  console.log('employees array:', filterOptions?.employees);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2 }}>
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant={filtersOpen ? "contained" : "outlined"}
            onClick={() => setFiltersOpen(!filtersOpen)}
            size="small"
          >
            {filtersOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
            {hasActiveFilters && (
              <Chip label="Активны" size="small" color="primary" sx={{ ml: 1 }} />
            )}
          </Button>
          {hasActiveFilters && (
            <Button onClick={clearFilters} size="small" color="secondary">
              Сбросить все фильтры
            </Button>
          )}
        </Box>
      </Box>

      {filtersOpen && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Фильтры
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Фильтр по сотрудникам - работает с объектами {id, name} */}
            <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Сотрудники</InputLabel>
                <Select
                  multiple
                  value={filters.employees}
                  onChange={handleEmployeeChange}
                  input={<OutlinedInput label="Сотрудники" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((workerId) => (
                        <Chip key={workerId} label={getEmployeeName(workerId)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {filterOptions?.employees?.map((employee: EmployeeOption) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Фильтр по типам заказов */}
            <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Типы заказов</InputLabel>
                <Select
                  multiple
                  value={filters.orderTypes}
                  onChange={handleOrderTypeChange}
                  input={<OutlinedInput label="Типы заказов" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {filterOptions?.orderTypes?.map((type: string) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Фильтр по позициям */}
            <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Позиции</InputLabel>
                <Select
                  multiple
                  value={filters.positions}
                  onChange={handlePositionChange}
                  input={<OutlinedInput label="Позиции" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {filterOptions?.positions?.map((position: string) => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {hasActiveFilters && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="text.secondary">
                Применены фильтры:
                {filters.employees.length > 0 && ` Сотрудники: ${filters.employees.map(id => getEmployeeName(id)).join(', ')}`}
                {filters.orderTypes.length > 0 && ` Типы: ${filters.orderTypes.join(', ')}`}
                {filters.positions.length > 0 && ` Позиции: ${filters.positions.join(', ')}`}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <RevenueChart data={revenueData} title="Выручка" color="#1976d2" valuePrefix="₽ " />
        <RevenueChart data={profitData} title="Прибыль" color="#4caf50" valuePrefix="₽ " />
        <RevenueChart data={ordersData} title="Количество заказов" color="#ff9800" valueSuffix=" шт" />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard title="Выручка" value={summary?.total_revenue || 0} prefix="₽ " />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard title="Прибыль" value={summary?.total_profit || 0} prefix="₽ " />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard title="Заказов" value={summary?.total_orders || 0} suffix=" шт" />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard title="Средний чек" value={Math.round(summary?.average_check || 0)} prefix="₽ " />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 160 }}>
          <MetricCard title="Маржинальность" value={margin} suffix="%" />
        </Box>
      </Box>
    </Container>
  );
};
