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

export const financeAPI = {
  getDashboard: async (
    periodType: PeriodType = 'month',
    startDate?: string,
    endDate?: string
  ): Promise<FinanceDashboardResponse> => {
    const params = new URLSearchParams();
    params.append('period_type', periodType);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await apiClient.get(`/finance/dashboard?${params.toString()}`);
    return response.data;
  },
};
