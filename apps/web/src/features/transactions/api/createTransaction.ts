import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateTransactionInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Transaction } from "./getTransactions";

export function useCreateTransaction(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, CreateTransactionInput>({
    mutationFn: (input) =>
      apiClient.post<Transaction>(`workspaces/${workspaceId}/transactions`, input),
    onSuccess: () => {
      // Invalidate transactions query
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
      // Invalidate accounts to update balances
      queryClient.invalidateQueries({ queryKey: ["accounts", workspaceId] });
      // Invalidate analytics query for dashboard
      queryClient.invalidateQueries({ queryKey: ["analytics", workspaceId] });
      toast.success("Transaction created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create transaction");
    },
  });
}
