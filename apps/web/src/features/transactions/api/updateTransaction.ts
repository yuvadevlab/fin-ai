import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { UpdateTransactionInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Transaction } from "./getTransactions";

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, { id: string; input: UpdateTransactionInput }>({
    mutationFn: ({ id, input }) => apiClient.patch<Transaction>(`transactions/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Transaction updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update transaction");
    },
  });
}
