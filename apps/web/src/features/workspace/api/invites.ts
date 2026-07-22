import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { WorkspaceInvite } from "@finai/shared-types";

export function usePendingInvites() {
  return useQuery<WorkspaceInvite[]>({
    queryKey: ["workspaceInvites", "pending"],
    queryFn: () => apiClient.get<WorkspaceInvite[]>("workspaces/invites/pending"),
  });
}

export function useWorkspaceInvites(workspaceId: string | null) {
  return useQuery<WorkspaceInvite[]>({
    queryKey: ["workspaceInvites", "sent", workspaceId],
    queryFn: () => apiClient.get<WorkspaceInvite[]>(`workspaces/${workspaceId}/invites`),
    enabled: !!workspaceId,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) =>
      apiClient.post<{ success: boolean; message: string }>(
        `workspaces/invites/${inviteId}/accept`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceInvites"] });
    },
  });
}

export function useRejectInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) =>
      apiClient.post<{ success: boolean; message: string }>(
        `workspaces/invites/${inviteId}/reject`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaceInvites"] });
    },
  });
}
