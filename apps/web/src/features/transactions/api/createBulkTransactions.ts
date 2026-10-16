import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { CreateBulkTransactionsInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Transaction } from "./getTransactions";

export function useCreateBulkTransactions() {
  const queryClient = useQueryClient();

  return useMutation<Transaction[], Error, CreateBulkTransactionsInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Transaction[]>(API_ENDPOINTS.TRANSACTIONS.BULK, input), {
          loading: "Uploading transactions...",
          success: (data) => `Successfully uploaded ${data.length} transactions!`,
          error: (error: Error) => error.message || "Failed to bulk upload transactions",
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
