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

export const healthScoreQueryKey = () => ["analytics", "health"] as const;

export function useHealthScore() {
  return useQuery<HealthScoreData>({
    queryKey: healthScoreQueryKey(),
    queryFn: () => apiClient.get<HealthScoreData>("analytics/health"),
  });
}

export async function prefetchHealthScore(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: healthScoreQueryKey(),
    queryFn: () => serverFetch<HealthScoreData>("analytics/health", token),
  });
}
