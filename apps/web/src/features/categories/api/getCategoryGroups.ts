import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";

export interface CategoryGroup {
  id: string;
  name: string;
  order: number;
}

export const categoryGroupsQueryKey = () => QUERY_KEYS.CATEGORIES.GROUPS;

export function useCategoryGroups() {
  return useQuery<CategoryGroup[]>({
    queryKey: categoryGroupsQueryKey(),
    queryFn: () => apiClient.get<CategoryGroup[]>(API_ENDPOINTS.CATEGORIES.GROUPS),
    staleTime: Infinity, // global data, rarely changes
  });
}
