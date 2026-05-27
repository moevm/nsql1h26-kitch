// api/finance.ts
import { apiClient } from './client';

export type PeriodType = 'day' | 'week' | 'month' | 'season' | 'year' | 'custom';

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  profit: number;
  order_count: number;
  average_check: number;
}

export interface FinanceSummary {
  period_type: PeriodType;
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_profit: number;
  total_orders: number;
  average_check: number;
  total_material_cost: number;
  total_delivery_fee: number;
  total_type_price: number;
  total_comment_fee: number;
}

export interface FinanceDashboardResponse {
  summary: FinanceSummary;
  daily_breakdown: RevenueByPeriod[];
  weekly_breakdown: RevenueByPeriod[];
  monthly_breakdown: RevenueByPeriod[];
  yearly_breakdown: RevenueByPeriod[];
}

export interface FinanceFiltersResponse {
  employees: { id: string; name: string }[];
  orderTypes: string[];
  positions: string[];
}

export const financeAPI = {
  getDashboard: async (
    periodType: PeriodType = 'month',
    startDate?: string,
    endDate?: string,
    filters?: { employees: string[]; orderTypes: string[]; positions: string[] }
  ): Promise<FinanceDashboardResponse> => {
    const params = new URLSearchParams();
    params.append('period_type', periodType);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    if (filters?.employees && filters.employees.length > 0) {
      params.append('employees', filters.employees.join(','));
    }
    if (filters?.orderTypes && filters.orderTypes.length > 0) {
      params.append('order_types', filters.orderTypes.join(','));
    }
    if (filters?.positions && filters.positions.length > 0) {
      params.append('positions', filters.positions.join(','));
    }

    const response = await apiClient.get(`/finance/dashboard?${params.toString()}`);
    return response.data;
  },

  getFilters: async (): Promise<FinanceFiltersResponse> => {
    const response = await apiClient.get('/finance/filters');
    return response.data;
  },
};
