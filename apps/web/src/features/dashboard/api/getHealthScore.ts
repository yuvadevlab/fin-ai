import { QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS, type HealthScore } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export type HealthScoreData = HealthScore;

export const healthScoreQueryKey = () => QUERY_KEYS.ANALYTICS.HEALTH;

export function useHealthScore() {
  return useQuery<HealthScoreData>({
    queryKey: healthScoreQueryKey(),
    queryFn: () => apiClient.get<HealthScoreData>(API_ENDPOINTS.ANALYTICS.HEALTH),
  });
}

export async function prefetchHealthScore(
  queryClient: QueryClient,
  token: string,
  workspaceId?: string,
) {
  await queryClient.prefetchQuery({
    queryKey: healthScoreQueryKey(),
    queryFn: () => serverFetch<HealthScoreData>(API_ENDPOINTS.ANALYTICS.HEALTH, token, workspaceId),
  });
}
