import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "@finai/ui";

export function useDeleteTransaction(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: (id) =>
      apiClient.delete<{ deleted: boolean }>(`workspaces/${workspaceId}/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", workspaceId] });
      toast.success("Transaction deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete transaction");
    },
  });
}
