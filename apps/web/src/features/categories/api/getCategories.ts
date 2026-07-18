import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface Category {
  id: string;
  name: string;
  group: string;
  icon: string | null;
  isSystem: boolean;
}

export const categoriesQueryKey = (workspaceId: string) => ["categories", workspaceId] as const;

export function useCategories(workspaceId: string | null) {
  return useQuery<Category[]>({
    queryKey: categoriesQueryKey(workspaceId ?? ""),
    queryFn: () => apiClient.get<Category[]>(`workspaces/${workspaceId}/categories`),
    enabled: !!workspaceId,
  });
}

export async function prefetchCategories(
  queryClient: QueryClient,
  workspaceId: string,
  token: string,
) {
  await queryClient.prefetchQuery({
    queryKey: categoriesQueryKey(workspaceId),
    queryFn: () => serverFetch<Category[]>(`workspaces/${workspaceId}/categories`, token),
  });
}
