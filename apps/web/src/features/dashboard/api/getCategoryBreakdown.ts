import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface CategoryBreakdownItem {
  categoryId: string | null;
  name: string;
  total: number;
}

export function useCategoryBreakdown(workspaceId: string | null) {
  return useQuery<CategoryBreakdownItem[]>({
    queryKey: ["analytics", "categories", workspaceId],
    queryFn: () =>
      apiClient.get<CategoryBreakdownItem[]>(`workspaces/${workspaceId}/analytics/categories`),
    enabled: !!workspaceId,
  });
}
