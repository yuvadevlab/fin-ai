import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";
import type { GoalType } from "@finai/shared-types";

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
}

export const goalsQueryKey = () => ["goals"] as const;

export function useGoals() {
  return useQuery<Goal[]>({
    queryKey: goalsQueryKey(),
    queryFn: () => apiClient.get<Goal[]>("goals"),
  });
}

export async function prefetchGoals(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: goalsQueryKey(),
    queryFn: () => serverFetch<Goal[]>("goals", token),
  });
}
