import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface HealthMetric {
  label: string;
  score: number;
  note: string;
}

export interface HealthScoreData {
  score: number;
  metrics: HealthMetric[];
  rating: string;
}

export function useHealthScore(workspaceId: string | null) {
  return useQuery<HealthScoreData>({
    queryKey: ["analytics", "health", workspaceId],
    queryFn: () => apiClient.get<HealthScoreData>(`workspaces/${workspaceId}/analytics/health`),
    enabled: !!workspaceId,
  });
}
