import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { toast } from "@finai/ui";

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: (id) =>
      toast
        .promise(apiClient.delete<{ deleted: boolean }>(API_ENDPOINTS.TRANSACTIONS.DETAIL(id)), {
          loading: "Deleting transaction...",
          success: "Transaction deleted successfully",
          error: (error: Error) => error.message || "Failed to delete transaction",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVESTMENTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOALS.ALL });
    },
  });
}
