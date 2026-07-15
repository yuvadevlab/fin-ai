import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface MonthlyCashFlow {
  month: string;
  income: number;
  expense: number;
}

export function useMonthlyAnalytics(workspaceId: string | null, months = 6) {
  return useQuery<MonthlyCashFlow[]>({
    queryKey: ["analytics", "monthly", workspaceId, months],
    queryFn: () =>
      apiClient.get<MonthlyCashFlow[]>(
        `workspaces/${workspaceId}/analytics/monthly?months=${months}`,
      ),
    enabled: !!workspaceId,
  });
}
