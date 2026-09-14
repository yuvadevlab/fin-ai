import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateBudgetInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Budget } from "./getBudgets";

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation<Budget, Error, CreateBudgetInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Budget>("budgets", input), {
          loading: "Creating budget...",
          success: "Budget created successfully",
          error: (error: Error) => error.message || "Failed to create budget",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
