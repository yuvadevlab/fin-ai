import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  group: string;
  order: number;
  isActive: boolean;
}

export function useMenuItems() {
  return useQuery<MenuItem[]>({
    queryKey: QUERY_KEYS.MENU_ITEMS.ALL,
    queryFn: () => apiClient.get<MenuItem[]>(API_ENDPOINTS.MENU_ITEMS.BASE),
    // Menu items are global/system config, so we can cache them for a long time
    staleTime: 5 * 60 * 1000,
  });
}
