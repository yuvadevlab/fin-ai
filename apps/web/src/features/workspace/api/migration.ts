import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface MigrateRecordsPayload {
  targetWorkspaceId: string;
  accountIds: string[];
  categoryIds: string[];
}

export function useMigrateRecords(sourceWorkspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MigrateRecordsPayload) =>
      apiClient.post<{ success: boolean; message: string }>(
        `workspaces/${sourceWorkspaceId}/migrate`,
        payload,
      ),
    onSuccess: (_, variables) => {
      // Invalidate queries for both source and target workspaces
      queryClient.invalidateQueries({ queryKey: ["accounts", sourceWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ["categories", sourceWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.targetWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ["categories", variables.targetWorkspaceId] });
    },
  });
}
