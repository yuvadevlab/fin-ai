import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

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

export const healthScoreQueryKey = (workspaceId: string) =>
  ["analytics", "health", workspaceId] as const;

export function useHealthScore(workspaceId: string | null) {
  return useQuery<HealthScoreData>({
    queryKey: healthScoreQueryKey(workspaceId ?? ""),
    queryFn: () => apiClient.get<HealthScoreData>(`workspaces/${workspaceId}/analytics/health`),
    enabled: !!workspaceId,
  });
}

export async function prefetchHealthScore(
  queryClient: QueryClient,
  workspaceId: string,
  token: string,
) {
  await queryClient.prefetchQuery({
    queryKey: healthScoreQueryKey(workspaceId),
    queryFn: () =>
      serverFetch<HealthScoreData>(`workspaces/${workspaceId}/analytics/health`, token),
  });
}
