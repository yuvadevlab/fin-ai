import { QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS, SEARCH_PARAMS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface SavingsTrendPoint {
  month: string;
  value: number;
}

export const savingsTrendQueryKey = (months: number) => QUERY_KEYS.ANALYTICS.SAVINGS_TREND(months);

export function useSavingsTrend(months = 6) {
  return useQuery<SavingsTrendPoint[]>({
    queryKey: savingsTrendQueryKey(months),
    queryFn: () =>
      apiClient.get<SavingsTrendPoint[]>(
        `${API_ENDPOINTS.ANALYTICS.SAVINGS_TREND}?${SEARCH_PARAMS.MONTHS}=${months}`,
      ),
  });
}

export async function prefetchSavingsTrend(queryClient: QueryClient, token: string, months = 6) {
  await queryClient.prefetchQuery({
    queryKey: savingsTrendQueryKey(months),
    queryFn: () =>
      serverFetch<SavingsTrendPoint[]>(
        `${API_ENDPOINTS.ANALYTICS.SAVINGS_TREND}?${SEARCH_PARAMS.MONTHS}=${months}`,
        token,
      ),
  });
}
