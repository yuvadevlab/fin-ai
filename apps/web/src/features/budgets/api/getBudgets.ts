import { QueryClient, useQuery } from "@tanstack/react-query";
import type { BudgetStatus } from "@finai/shared-types";
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
}

export const budgetsQueryKey = () => ["budgets"] as const;

export function useBudgets() {
  return useQuery<Budget[]>({
    queryKey: budgetsQueryKey(),
    queryFn: () => apiClient.get<Budget[]>("budgets"),
  });
}

export async function prefetchBudgets(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: budgetsQueryKey(),
    queryFn: () => serverFetch<Budget[]>("budgets", token),
  });
}
