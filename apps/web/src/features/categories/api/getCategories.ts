import { QueryClient, useQuery } from "@tanstack/react-query";
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

export const categoriesQueryKey = () => ["categories"] as const;

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: categoriesQueryKey(),
    queryFn: () => apiClient.get<Category[]>("categories"),
  });
}

export async function prefetchCategories(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: categoriesQueryKey(),
    queryFn: () => serverFetch<Category[]>("categories", token),
  });
}
