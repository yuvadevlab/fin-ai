import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, type WorkspaceMember } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { toast } from "@finai/ui";
import { workspacesQueryKey } from "./getWorkspaces";

export function useLeaveWorkspace() {
  const queryClient = useQueryClient();

  return useMutation<WorkspaceMember, Error, string>({
    mutationFn: (workspaceId) =>
      toast
        .promise(apiClient.post<WorkspaceMember>(API_ENDPOINTS.WORKSPACES.LEAVE(workspaceId)), {
          loading: "Leaving workspace...",
          success: "You have left the workspace",
          error: (error: Error) => error.message || "Failed to leave workspace",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspacesQueryKey() });
    },
  });
}
