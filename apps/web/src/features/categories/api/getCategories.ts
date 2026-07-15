import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Category {
  id: string;
  name: string;
  group: string;
  icon: string | null;
  isSystem: boolean;
}

export function useCategories(workspaceId: string | null) {
  return useQuery<Category[]>({
    queryKey: ["categories", workspaceId],
    queryFn: () => apiClient.get<Category[]>(`workspaces/${workspaceId}/categories`),
    enabled: !!workspaceId,
  });
}
