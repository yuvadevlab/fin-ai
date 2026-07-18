import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface MonthlyCashFlow {
  month: string;
  income: number;
  expense: number;
}

export const monthlyAnalyticsQueryKey = (workspaceId: string, months: number) =>
  ["analytics", "monthly", workspaceId, months] as const;

export function useMonthlyAnalytics(workspaceId: string | null, months = 6) {
  return useQuery<MonthlyCashFlow[]>({
    queryKey: monthlyAnalyticsQueryKey(workspaceId ?? "", months),
    queryFn: () =>
      apiClient.get<MonthlyCashFlow[]>(
        `workspaces/${workspaceId}/analytics/monthly?months=${months}`,
      ),
    enabled: !!workspaceId,
  });
}

export async function prefetchMonthlyAnalytics(
  queryClient: QueryClient,
  workspaceId: string,
  token: string,
  months = 6,
) {
  await queryClient.prefetchQuery({
    queryKey: monthlyAnalyticsQueryKey(workspaceId, months),
    queryFn: () =>
      serverFetch<MonthlyCashFlow[]>(
        `workspaces/${workspaceId}/analytics/monthly?months=${months}`,
        token,
      ),
  });
}
