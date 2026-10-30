import { QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS, SEARCH_PARAMS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface MonthlyCashFlow {
  month: string;
  income: number;
  expense: number;
  investment?: number;
}

export const monthlyAnalyticsQueryKey = (months: number | string) =>
  QUERY_KEYS.ANALYTICS.MONTHLY(months);

export function useMonthlyAnalytics(months: number | string = 6) {
  return useQuery<MonthlyCashFlow[]>({
    queryKey: monthlyAnalyticsQueryKey(months),
    queryFn: () =>
      apiClient.get<MonthlyCashFlow[]>(
        `${API_ENDPOINTS.ANALYTICS.MONTHLY}?${SEARCH_PARAMS.MONTHS}=${months}`,
      ),
  });
}

export async function prefetchMonthlyAnalytics(
  queryClient: QueryClient,
  token: string,
  months = 6,
  workspaceId?: string,
) {
  await queryClient.prefetchQuery({
    queryKey: monthlyAnalyticsQueryKey(months),
    queryFn: () =>
      serverFetch<MonthlyCashFlow[]>(
        `${API_ENDPOINTS.ANALYTICS.MONTHLY}?${SEARCH_PARAMS.MONTHS}=${months}`,
        token,
        workspaceId,
      ),
  });
}
