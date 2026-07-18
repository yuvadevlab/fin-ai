import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface SavingsTrendPoint {
  month: string;
  value: number;
}

export function useSavingsTrend(workspaceId: string | null, months = 6) {
  return useQuery<SavingsTrendPoint[]>({
    queryKey: ["analytics", "savings-trend", workspaceId, months],
    queryFn: () =>
      apiClient.get<SavingsTrendPoint[]>(
        `workspaces/${workspaceId}/analytics/savings-trend?months=${months}`,
      ),
    enabled: !!workspaceId,
  });
}
