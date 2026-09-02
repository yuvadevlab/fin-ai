import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface CategoryGroup {
  id: string;
  name: string;
  order: number;
}

export const categoryGroupsQueryKey = () => ["category-groups"] as const;

export function useCategoryGroups() {
  return useQuery<CategoryGroup[]>({
    queryKey: categoryGroupsQueryKey(),
    queryFn: () => apiClient.get<CategoryGroup[]>("categories/groups"),
    staleTime: Infinity, // global data, rarely changes
  });
}
