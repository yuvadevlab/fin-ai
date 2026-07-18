import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface Budget {
  id: string;
  workspaceId: string;
  categoryId: string;
  limit: number;
  period: "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  /** Computed by the API: total spent in this budget period */
  spent?: number;
  /** Computed by the API: ON_TRACK | NEAR_LIMIT | OVER */
  status?: string;
  category?: {
    id: string;
    name: string;
    group: string;
  };
}

export const budgetsQueryKey = (workspaceId: string) => ["budgets", workspaceId] as const;

export function useBudgets(workspaceId: string | null) {
  return useQuery<Budget[]>({
    queryKey: budgetsQueryKey(workspaceId ?? ""),
    queryFn: () => apiClient.get<Budget[]>(`workspaces/${workspaceId}/budgets`),
    enabled: !!workspaceId,
  });
}

export async function prefetchBudgets(
  queryClient: QueryClient,
  workspaceId: string,
  token: string,
) {
  await queryClient.prefetchQuery({
    queryKey: budgetsQueryKey(workspaceId),
    queryFn: () => serverFetch<Budget[]>(`workspaces/${workspaceId}/budgets`, token),
  });
}
