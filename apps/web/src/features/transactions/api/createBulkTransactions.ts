import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateTransactionInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Transaction } from "./getTransactions";

export function useCreateBulkTransactions(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Transaction[], Error, CreateTransactionInput[]>({
    mutationFn: (inputs) =>
      apiClient.post<Transaction[]>(`workspaces/${workspaceId}/transactions/bulk`, inputs),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", workspaceId] });
      toast.success(`Successfully added ${data.length} transactions in bulk!`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add bulk transactions");
    },
  });
}
