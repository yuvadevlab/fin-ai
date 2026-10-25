import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, type WorkspaceInvitation } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { type InviteWorkspaceMemberInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { workspaceMembersQueryKey } from "./getWorkspaceMembers";

interface InviteMemberVariables {
  workspaceId: string;
  input: InviteWorkspaceMemberInput;
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation<WorkspaceInvitation, Error, InviteMemberVariables>({
    mutationFn: ({ workspaceId, input }) =>
      toast
        .promise(
          apiClient.post<WorkspaceInvitation>(
            API_ENDPOINTS.WORKSPACES.INVITATIONS(workspaceId),
            input,
          ),
          {
            loading: "Sending invitation...",
            success: "Invitation sent successfully",
            error: (error: Error) => error.message || "Failed to send invitation",
          },
        )
        .unwrap(),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: workspaceMembersQueryKey(workspaceId) });
    },
  });
}
