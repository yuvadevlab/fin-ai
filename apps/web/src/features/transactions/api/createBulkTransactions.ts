import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateBulkTransactionsInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Transaction } from "./getTransactions";

export function useCreateBulkTransactions() {
  const queryClient = useQueryClient();

  return useMutation<Transaction[], Error, CreateBulkTransactionsInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Transaction[]>("transactions/bulk", input), {
          loading: "Uploading transactions...",
          success: (data) => `Successfully uploaded ${data.length} transactions!`,
          error: (error: Error) => error.message || "Failed to bulk upload transactions",
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
