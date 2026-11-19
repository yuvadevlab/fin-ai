import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@fin-ai/shared-types";
import { apiClient } from "@/lib/api-client";
import { UpdateBudgetInput } from "@fin-ai/validation";
import { toast } from "@fin-ai/ui";
import { Budget } from "./getBudgets";

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation<Budget, Error, { id: string; input: UpdateBudgetInput }>({
    mutationFn: ({ id, input }) =>
      toast
        .promise(apiClient.patch<Budget>(API_ENDPOINTS.BUDGETS.DETAIL(id), input), {
          loading: "Updating budget...",
          success: "Budget updated successfully",
          error: (error: Error) => error.message || "Failed to update budget",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.ALL });
    },
  });
}
