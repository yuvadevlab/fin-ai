import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useActiveWorkspace } from "@/hooks";

interface CreateWorkspacePayload {
  name: string;
  type: "PERSONAL" | "FAMILY";
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const { setActiveWorkspaceId } = useActiveWorkspace();

  return useMutation({
    mutationFn: (payload: CreateWorkspacePayload) =>
      apiClient.post<{ id: string; name: string; type: string }>("workspaces", payload),
    onSuccess: (data) => {
      // Invalidate workspaces list
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      // Switch immediately to the new workspace
      if (data?.id) {
        setActiveWorkspaceId(data.id);
      }
    },
  });
}
