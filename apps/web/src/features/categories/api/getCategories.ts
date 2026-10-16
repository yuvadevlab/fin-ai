import { QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface Category {
  id: string;
  userId: string;
  name: string;
  group: string;
  icon: string | null;
  isDefault?: boolean;
}

export const categoriesQueryKey = () => QUERY_KEYS.CATEGORIES.ALL;

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: categoriesQueryKey(),
    queryFn: () => apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.BASE),
  });
}

export async function prefetchCategories(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: categoriesQueryKey(),
    queryFn: () => serverFetch<Category[]>(API_ENDPOINTS.CATEGORIES.BASE, token),
  });
}
