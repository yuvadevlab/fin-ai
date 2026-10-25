import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS, InvitationAction } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { toast } from "@finai/ui";
import { UI_COPY } from "@/lib";
import { myInvitationsQueryKey } from "./getMyInvitations";
import { workspacesQueryKey } from "./getWorkspaces";

interface RespondInvitationVariables {
  invitationId: string;
  action: InvitationAction;
}

export function useRespondInvitation() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; workspaceId?: string }, Error, RespondInvitationVariables>(
    {
      mutationFn: ({ invitationId, action }) => {
        const isAccept = action === InvitationAction.ACCEPT;
        const endpoint = isAccept
          ? API_ENDPOINTS.WORKSPACES.ACCEPT_INVITATION(invitationId)
          : API_ENDPOINTS.WORKSPACES.REJECT_INVITATION(invitationId);

        return toast
          .promise(apiClient.post<{ success: boolean; workspaceId?: string }>(endpoint), {
            loading: isAccept
              ? UI_COPY.WORKSPACES.JOINING_WORKSPACE
              : UI_COPY.WORKSPACES.DECLINING_INVITATION,
            success: isAccept
              ? UI_COPY.WORKSPACES.JOINED_SUCCESS
              : UI_COPY.WORKSPACES.DECLINED_SUCCESS,
            error: (error: Error) => error.message || UI_COPY.WORKSPACES.RESPOND_ERROR,
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
