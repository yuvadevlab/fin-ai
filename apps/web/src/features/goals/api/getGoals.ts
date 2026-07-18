import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

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

export const goalsQueryKey = (workspaceId: string) => ["goals", workspaceId] as const;

export function useGoals(workspaceId: string | null) {
  return useQuery<Goal[]>({
    queryKey: goalsQueryKey(workspaceId ?? ""),
    queryFn: () => apiClient.get<Goal[]>(`workspaces/${workspaceId}/goals`),
    enabled: !!workspaceId,
  });
}

export async function prefetchGoals(queryClient: QueryClient, workspaceId: string, token: string) {
  await queryClient.prefetchQuery({
    queryKey: goalsQueryKey(workspaceId),
    queryFn: () => serverFetch<Goal[]>(`workspaces/${workspaceId}/goals`, token),
  });
}
