import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface CategoryBreakdownItem {
  categoryId: string | null;
  name: string;
  total: number;
}

export const categoryBreakdownQueryKey = (workspaceId: string) =>
  ["analytics", "categories", workspaceId] as const;

export function useCategoryBreakdown(workspaceId: string | null) {
  return useQuery<CategoryBreakdownItem[]>({
    queryKey: categoryBreakdownQueryKey(workspaceId ?? ""),
    queryFn: () =>
      apiClient.get<CategoryBreakdownItem[]>(`workspaces/${workspaceId}/analytics/categories`),
    enabled: !!workspaceId,
  });
}

export async function prefetchCategoryBreakdown(
  queryClient: QueryClient,
  workspaceId: string,
  token: string,
) {
  await queryClient.prefetchQuery({
    queryKey: categoryBreakdownQueryKey(workspaceId),
    queryFn: () =>
      serverFetch<CategoryBreakdownItem[]>(`workspaces/${workspaceId}/analytics/categories`, token),
  });
}
