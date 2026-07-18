import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface SavingsTrendPoint {
  month: string;
  value: number;
}

export const savingsTrendQueryKey = (workspaceId: string, months: number) =>
  ["analytics", "savings-trend", workspaceId, months] as const;

export function useSavingsTrend(workspaceId: string | null, months = 6) {
  return useQuery<SavingsTrendPoint[]>({
    queryKey: savingsTrendQueryKey(workspaceId ?? "", months),
    queryFn: () =>
      apiClient.get<SavingsTrendPoint[]>(
        `workspaces/${workspaceId}/analytics/savings-trend?months=${months}`,
      ),
    enabled: !!workspaceId,
  });
}

export async function prefetchSavingsTrend(
  queryClient: QueryClient,
  workspaceId: string,
  token: string,
  months = 6,
) {
  await queryClient.prefetchQuery({
    queryKey: savingsTrendQueryKey(workspaceId, months),
    queryFn: () =>
      serverFetch<SavingsTrendPoint[]>(
        `workspaces/${workspaceId}/analytics/savings-trend?months=${months}`,
        token,
      ),
  });
}
