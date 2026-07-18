import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { getWorkspaceMembersQueryKey } from "./getMembers";

interface InviteMemberPayload {
  workspaceId: string;
  email: string;
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, email }: InviteMemberPayload) =>
      apiClient.post(`workspaces/${workspaceId}/invites`, { email }),
    onSuccess: (_, { workspaceId }) => {
      // Invalidate the members list and workspaces list (so member count updates in sidebar/header)
      queryClient.invalidateQueries({ queryKey: getWorkspaceMembersQueryKey(workspaceId) });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
