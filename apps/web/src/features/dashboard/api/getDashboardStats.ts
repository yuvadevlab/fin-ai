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

export const dashboardStatsQueryKey = (workspaceId: string) =>
  ["analytics", "dashboard", workspaceId] as const;

export function useDashboardStats(workspaceId: string | null) {
  return useQuery<DashboardStats>({
    queryKey: dashboardStatsQueryKey(workspaceId ?? ""),
    queryFn: () => apiClient.get<DashboardStats>(`workspaces/${workspaceId}/analytics/dashboard`),
    enabled: !!workspaceId,
  });
}

export async function prefetchDashboardStats(
  queryClient: QueryClient,
  workspaceId: string,
  token: string,
) {
  await queryClient.prefetchQuery({
    queryKey: dashboardStatsQueryKey(workspaceId),
    queryFn: () =>
      serverFetch<DashboardStats>(`workspaces/${workspaceId}/analytics/dashboard`, token),
  });
}
