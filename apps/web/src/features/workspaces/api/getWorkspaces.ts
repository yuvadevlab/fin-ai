import { QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS, type WorkspaceWithRole } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export const workspacesQueryKey = () => QUERY_KEYS.WORKSPACES.ALL;

export function useWorkspaces() {
  return useQuery<WorkspaceWithRole[]>({
    queryKey: workspacesQueryKey(),
    queryFn: () => apiClient.get<WorkspaceWithRole[]>(API_ENDPOINTS.WORKSPACES.BASE),
  });
}

export async function prefetchWorkspaces(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: workspacesQueryKey(),
    queryFn: () => serverFetch<WorkspaceWithRole[]>(API_ENDPOINTS.WORKSPACES.BASE, token),
  });
}
