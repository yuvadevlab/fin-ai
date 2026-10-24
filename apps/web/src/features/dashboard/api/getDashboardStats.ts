import { QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface DashboardStats {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  lastMonthIncome: number;
  lastMonthExpenses: number;
  accountCount: number;
  goalCount: number;
}

export const dashboardStatsQueryKey = () => QUERY_KEYS.ANALYTICS.DASHBOARD;

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: dashboardStatsQueryKey(),
    queryFn: () => apiClient.get<DashboardStats>(API_ENDPOINTS.ANALYTICS.DASHBOARD),
  });
}

export async function prefetchDashboardStats(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: dashboardStatsQueryKey(),
    queryFn: () => serverFetch<DashboardStats>(API_ENDPOINTS.ANALYTICS.DASHBOARD, token),
  });
}
