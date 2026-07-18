import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { getWorkspaceMembersQueryKey } from "./getMembers";

interface RemoveMemberPayload {
  workspaceId: string;
  memberId: string;
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, memberId }: RemoveMemberPayload) =>
      apiClient.delete(`workspaces/${workspaceId}/members/${memberId}`),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getWorkspaceMembersQueryKey(workspaceId) });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
