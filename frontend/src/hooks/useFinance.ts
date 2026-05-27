import { useQuery } from '@tanstack/react-query';
import { financeAPI, type PeriodType } from '../api/finance';

export const useFinanceDashboard = (
  periodType: PeriodType = 'month',
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['finance', 'dashboard', periodType, startDate, endDate],
    queryFn: () => financeAPI.getDashboard(periodType, startDate, endDate),
  });
};
