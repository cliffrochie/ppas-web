import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { ApiResponse, PurchaseRequestStatus } from '@/types';

export interface DashboardFilters {
  year?: number;
  office_id?: number;
}

export interface DashboardKpi {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  completed_requests: number;
}

export interface BudgetUtilizationMonth {
  month: number;
  label: string;
  total: number;
}

export interface BudgetUtilizationByMonth {
  months: BudgetUtilizationMonth[];
  grand_total: number;
}

export interface RequestsPerSection {
  office: string;
  count: number;
}

export interface BudgetPerSection {
  office: string;
  total: number;
}

export interface RequestsPerCategory {
  category: string;
  count: number;
}

export interface RecentRequest {
  rf_number: string | null;
  pr_number: string | null;
  requester: string | null;
  office: string | null;
  total_amount: string;
  status: PurchaseRequestStatus;
}

export interface HighValueRequest {
  rf_number: string | null;
  purpose: string;
  office: string | null;
  total_amount: string;
}

export interface DashboardSummary {
  kpi: DashboardKpi;
  budget_utilization_by_month: BudgetUtilizationByMonth;
  requests_per_section: RequestsPerSection[];
  budget_per_section: BudgetPerSection[];
  requests_per_category: RequestsPerCategory[];
  recent_requests: RecentRequest[];
  high_value_requests: HighValueRequest[];
}

const dashboardApi = {
  summary: async (filters: DashboardFilters): Promise<ApiResponse<DashboardSummary>> => {
    const { data } = await api.get('/dashboard', { params: filters });
    return data;
  },
};

export const useDashboard = (filters: DashboardFilters = {}) =>
  useQuery({
    queryKey: ['dashboard', filters] as const,
    queryFn: () => dashboardApi.summary(filters),
    select: (res) => res.data,
  });
