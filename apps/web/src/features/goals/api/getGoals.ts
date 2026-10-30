import { QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS, type GoalType } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  type?: GoalType;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}

export const goalsQueryKey = () => QUERY_KEYS.GOALS.ALL;

export function useGoals() {
  return useQuery<Goal[]>({
    queryKey: goalsQueryKey(),
    queryFn: () => apiClient.get<Goal[]>(API_ENDPOINTS.GOALS.BASE),
  });
}

export async function prefetchGoals(queryClient: QueryClient, token: string, workspaceId?: string) {
  await queryClient.prefetchQuery({
    queryKey: goalsQueryKey(),
    queryFn: () => serverFetch<Goal[]>(API_ENDPOINTS.GOALS.BASE, token, workspaceId),
  });
}
