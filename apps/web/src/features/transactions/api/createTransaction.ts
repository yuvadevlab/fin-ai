import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { CreateTransactionInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Transaction } from "./getTransactions";

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, CreateTransactionInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Transaction>(API_ENDPOINTS.TRANSACTIONS.BASE, input), {
          loading: "Creating transaction...",
          success: "Transaction created successfully",
          error: (error: Error) => error.message || "Failed to create transaction",
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
