import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { UpdateTransactionInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Transaction } from "./getTransactions";

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, { id: string; input: UpdateTransactionInput }>({
    mutationFn: ({ id, input }) =>
      toast
        .promise(apiClient.patch<Transaction>(`transactions/${id}`, input), {
          loading: "Updating transaction...",
          success: "Transaction updated successfully",
          error: (error: Error) => error.message || "Failed to update transaction",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}
