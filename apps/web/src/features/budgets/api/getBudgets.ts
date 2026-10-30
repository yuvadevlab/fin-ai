import { QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS, type BudgetStatus } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  limit: number;
  startDate: string;
  /** Computed by the API: total spent in this month */
  spent?: number;
  /** Computed by the API: BudgetStatus enum */
  status?: BudgetStatus;
  category?: {
    id: string;
    name: string;
    group: string;
  };
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}

export const budgetsQueryKey = () => QUERY_KEYS.BUDGETS.ALL;

export function useBudgets() {
  return useQuery<Budget[]>({
    queryKey: budgetsQueryKey(),
    queryFn: () => apiClient.get<Budget[]>(API_ENDPOINTS.BUDGETS.BASE),
  });
}

export async function prefetchBudgets(
  queryClient: QueryClient,
  token: string,
  workspaceId?: string,
) {
  await queryClient.prefetchQuery({
    queryKey: budgetsQueryKey(),
    queryFn: () => serverFetch<Budget[]>(API_ENDPOINTS.BUDGETS.BASE, token, workspaceId),
  });
}
