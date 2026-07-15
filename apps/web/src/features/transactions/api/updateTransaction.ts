import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { UpdateTransactionInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Transaction } from "./getTransactions";

export interface UpdateTransactionParams {
  id: string;
  input: UpdateTransactionInput;
}

export function useUpdateTransaction(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, UpdateTransactionParams>({
    mutationFn: ({ id, input }) =>
      apiClient.patch<Transaction>(`workspaces/${workspaceId}/transactions/${id}`, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", workspaceId] });
      // Also update single transaction query if any
      queryClient.invalidateQueries({
        queryKey: ["transaction", workspaceId, data.id],
      });
      toast.success("Transaction updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update transaction");
    },
  });
}
