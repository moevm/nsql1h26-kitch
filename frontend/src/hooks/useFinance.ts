// hooks/useFinance.ts
import { useQuery } from '@tanstack/react-query';
import { financeAPI, type PeriodType, type FinanceFiltersResponse } from '../api/finance';

export const useFinanceDashboard = (
  periodType: PeriodType = 'month',
  startDate?: string,
  endDate?: string,
  filters?: { employees: string[]; orderTypes: string[]; positions: string[] }
) => {
  return useQuery({
    queryKey: ['finance', 'dashboard', periodType, startDate, endDate, filters],
    queryFn: () => financeAPI.getDashboard(periodType, startDate, endDate, filters),
  });
};

export const useFinanceFilters = () => {
  return useQuery<FinanceFiltersResponse>({
    queryKey: ['finance', 'filters'],
    queryFn: () => financeAPI.getFilters(),
  });
};
