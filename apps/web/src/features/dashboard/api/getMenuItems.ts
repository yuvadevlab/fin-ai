import { useQuery } from "@tanstack/react-query";
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
    queryKey: ["menu-items"],
    queryFn: () => apiClient.get<MenuItem[]>("menu-items"),
    // Menu items are global/system config, so we can cache them for a long time
    staleTime: 5 * 60 * 1000,
  });
}
