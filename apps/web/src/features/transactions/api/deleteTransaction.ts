import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "@finai/ui";

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: (id) => apiClient.delete<{ deleted: boolean }>(`transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Transaction deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete transaction");
    },
  });
}
