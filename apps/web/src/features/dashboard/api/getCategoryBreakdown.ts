import { QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface CategoryBreakdownItem {
  categoryId: string | null;
  name: string;
  total: number;
}

export const categoryBreakdownQueryKey = () => QUERY_KEYS.ANALYTICS.CATEGORIES;

export function useCategoryBreakdown() {
  return useQuery<CategoryBreakdownItem[]>({
    queryKey: categoryBreakdownQueryKey(),
    queryFn: () => apiClient.get<CategoryBreakdownItem[]>(API_ENDPOINTS.ANALYTICS.CATEGORIES),
  });
}

export async function prefetchCategoryBreakdown(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: categoryBreakdownQueryKey(),
    queryFn: () => serverFetch<CategoryBreakdownItem[]>(API_ENDPOINTS.ANALYTICS.CATEGORIES, token),
  });
}
