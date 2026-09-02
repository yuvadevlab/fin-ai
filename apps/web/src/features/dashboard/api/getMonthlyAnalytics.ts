import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface MonthlyCashFlow {
  month: string;
  income: number;
  expense: number;
}

export const monthlyAnalyticsQueryKey = (months: number) =>
  ["analytics", "monthly", months] as const;

export function useMonthlyAnalytics(months = 6) {
  return useQuery<MonthlyCashFlow[]>({
    queryKey: monthlyAnalyticsQueryKey(months),
    queryFn: () => apiClient.get<MonthlyCashFlow[]>(`analytics/monthly?months=${months}`),
  });
}

export async function prefetchMonthlyAnalytics(
  queryClient: QueryClient,
  token: string,
  months = 6,
) {
  await queryClient.prefetchQuery({
    queryKey: monthlyAnalyticsQueryKey(months),
    queryFn: () => serverFetch<MonthlyCashFlow[]>(`analytics/monthly?months=${months}`, token),
  });
}
