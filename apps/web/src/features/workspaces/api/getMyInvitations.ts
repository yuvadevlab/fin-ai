import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS, type WorkspaceInvitation } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";

export const myInvitationsQueryKey = () => QUERY_KEYS.WORKSPACES.INVITATIONS;

export function useMyInvitations() {
  return useQuery<WorkspaceInvitation[]>({
    queryKey: myInvitationsQueryKey(),
    queryFn: () => apiClient.get<WorkspaceInvitation[]>(API_ENDPOINTS.WORKSPACES.MY_INVITATIONS),
  });
}
