import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Goal {
  id: string;
  workspaceId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  type: "PERSONAL" | "FAMILY";
  createdAt: string;
  updatedAt: string;
}

export function useGoals(workspaceId: string | null) {
  return useQuery<Goal[]>({
    queryKey: ["goals", workspaceId],
    queryFn: () => apiClient.get<Goal[]>(`workspaces/${workspaceId}/goals`),
    enabled: !!workspaceId,
  });
}
