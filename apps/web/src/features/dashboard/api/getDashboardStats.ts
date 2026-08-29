import { QueryClient, useQuery } from "@tanstack/react-query";
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

export const dashboardStatsQueryKey = () => ["analytics", "dashboard"] as const;

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: dashboardStatsQueryKey(),
    queryFn: () => apiClient.get<DashboardStats>("analytics/dashboard"),
  });
}

export async function prefetchDashboardStats(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: dashboardStatsQueryKey(),
    queryFn: () => serverFetch<DashboardStats>("analytics/dashboard", token),
  });
}
