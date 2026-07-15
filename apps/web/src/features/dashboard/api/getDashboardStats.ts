import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

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

export function useDashboardStats(workspaceId: string | null) {
  return useQuery<DashboardStats>({
    queryKey: ["analytics", "dashboard", workspaceId],
    queryFn: () => apiClient.get<DashboardStats>(`workspaces/${workspaceId}/analytics/dashboard`),
    enabled: !!workspaceId,
  });
}
