import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, type Workspace } from "@fin-ai/shared-types";
import { apiClient } from "@/lib/api-client";
import { type CreateWorkspaceInput } from "@fin-ai/validation";
import { toast } from "@fin-ai/ui";
import { workspacesQueryKey } from "./getWorkspaces";

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation<Workspace, Error, CreateWorkspaceInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Workspace>(API_ENDPOINTS.WORKSPACES.BASE, input), {
          loading: "Creating workspace...",
          success: "Workspace created successfully",
          error: (error: Error) => error.message || "Failed to create workspace",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspacesQueryKey() });
    },
  });
}
