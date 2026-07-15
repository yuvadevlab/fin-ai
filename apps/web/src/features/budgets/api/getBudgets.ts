import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

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

export function useBudgets(workspaceId: string | null) {
  return useQuery<Budget[]>({
    queryKey: ["budgets", workspaceId],
    queryFn: () => apiClient.get<Budget[]>(`workspaces/${workspaceId}/budgets`),
    enabled: !!workspaceId,
  });
}
