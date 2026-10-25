import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { toast } from "@finai/ui";
import { myInvitationsQueryKey } from "./getMyInvitations";
import { workspacesQueryKey } from "./getWorkspaces";

interface RespondInvitationVariables {
  invitationId: string;
  action: "accept" | "reject";
}

export function useRespondInvitation() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; workspaceId?: string }, Error, RespondInvitationVariables>(
    {
      mutationFn: ({ invitationId, action }) => {
        const endpoint =
          action === "accept"
            ? API_ENDPOINTS.WORKSPACES.ACCEPT_INVITATION(invitationId)
            : API_ENDPOINTS.WORKSPACES.REJECT_INVITATION(invitationId);

        return toast
          .promise(apiClient.post<{ success: boolean; workspaceId?: string }>(endpoint), {
            loading: action === "accept" ? "Joining workspace..." : "Declining invitation...",
            success: action === "accept" ? "Joined workspace successfully!" : "Invitation declined",
            error: (error: Error) => error.message || "Failed to process invitation",
          })
          .unwrap();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: myInvitationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: workspacesQueryKey() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT });
      },
    },
  );
}
