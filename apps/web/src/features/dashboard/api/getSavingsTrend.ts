import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface SavingsTrendPoint {
  month: string;
  value: number;
}

export const savingsTrendQueryKey = (months: number) =>
  ["analytics", "savings-trend", months] as const;

export function useSavingsTrend(months = 6) {
  return useQuery<SavingsTrendPoint[]>({
    queryKey: savingsTrendQueryKey(months),
    queryFn: () => apiClient.get<SavingsTrendPoint[]>(`analytics/savings-trend?months=${months}`),
  });
}

export async function prefetchSavingsTrend(queryClient: QueryClient, token: string, months = 6) {
  await queryClient.prefetchQuery({
    queryKey: savingsTrendQueryKey(months),
    queryFn: () =>
      serverFetch<SavingsTrendPoint[]>(`analytics/savings-trend?months=${months}`, token),
  });
}
