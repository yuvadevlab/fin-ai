import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateTransactionInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Transaction } from "./getTransactions";

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, CreateTransactionInput>({
    mutationFn: (input) => apiClient.post<Transaction>("transactions", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Transaction created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create transaction");
    },
  });
}
