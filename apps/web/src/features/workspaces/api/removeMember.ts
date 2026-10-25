import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, type WorkspaceMember } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { toast } from "@finai/ui";
import { workspaceMembersQueryKey } from "./getWorkspaceMembers";
import { workspacesQueryKey } from "./getWorkspaces";

interface RemoveMemberVariables {
  workspaceId: string;
  memberUserId: string;
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation<WorkspaceMember, Error, RemoveMemberVariables>({
    mutationFn: ({ workspaceId, memberUserId }) =>
      toast
        .promise(
          apiClient.delete<WorkspaceMember>(
            API_ENDPOINTS.WORKSPACES.MEMBER(workspaceId, memberUserId),
          ),
          {
            loading: "Removing member...",
            success: "Member removed from workspace",
            error: (error: Error) => error.message || "Failed to remove member",
          },
        )
        .unwrap(),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: workspaceMembersQueryKey(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspacesQueryKey() });
    },
  });
}
