import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateBudgetInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Budget } from "./getBudgets";

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation<Budget, Error, CreateBudgetInput>({
    mutationFn: (input) => apiClient.post<Budget>("budgets", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Budget created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create budget");
    },
  });
}
