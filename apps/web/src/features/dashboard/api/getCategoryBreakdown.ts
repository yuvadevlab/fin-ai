import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface CategoryBreakdownItem {
  categoryId: string | null;
  name: string;
  total: number;
}

export const categoryBreakdownQueryKey = () => ["analytics", "categories"] as const;

export function useCategoryBreakdown() {
  return useQuery<CategoryBreakdownItem[]>({
    queryKey: categoryBreakdownQueryKey(),
    queryFn: () => apiClient.get<CategoryBreakdownItem[]>("analytics/categories"),
  });
}

export async function prefetchCategoryBreakdown(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: categoryBreakdownQueryKey(),
    queryFn: () => serverFetch<CategoryBreakdownItem[]>("analytics/categories", token),
  });
}
