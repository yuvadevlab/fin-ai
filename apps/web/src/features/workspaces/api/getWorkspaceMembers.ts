import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS, type WorkspaceMember } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";

export const workspaceMembersQueryKey = (workspaceId: string) =>
  QUERY_KEYS.WORKSPACES.MEMBERS(workspaceId);

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery<WorkspaceMember[]>({
    queryKey: workspaceMembersQueryKey(workspaceId),
    queryFn: () => apiClient.get<WorkspaceMember[]>(API_ENDPOINTS.WORKSPACES.MEMBERS(workspaceId)),
    enabled: Boolean(workspaceId),
  });
}
