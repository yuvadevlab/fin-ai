import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateBulkTransactionsInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Transaction } from "./getTransactions";

export function useCreateBulkTransactions() {
  const queryClient = useQueryClient();

  return useMutation<Transaction[], Error, CreateBulkTransactionsInput>({
    mutationFn: (input) => apiClient.post<Transaction[]>("transactions/bulk", input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success(`Successfully uploaded ${data.length} transactions!`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to bulk upload transactions");
    },
  });
}
