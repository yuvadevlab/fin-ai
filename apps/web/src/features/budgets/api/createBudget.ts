import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@fin-ai/shared-types";
import { apiClient } from "@/lib/api-client";
import { CreateBudgetInput } from "@fin-ai/validation";
import { toast } from "@fin-ai/ui";
import { Budget } from "./getBudgets";

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation<Budget, Error, CreateBudgetInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Budget>(API_ENDPOINTS.BUDGETS.BASE, input), {
          loading: "Creating budget...",
          success: "Budget created successfully",
          error: (error: Error) => error.message || "Failed to create budget",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.ALL });
    },
  });
}
