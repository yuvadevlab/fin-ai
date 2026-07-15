import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateBudgetInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Budget } from "./getBudgets";

export function useCreateBudget(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Budget, Error, CreateBudgetInput>({
    mutationFn: (input) => apiClient.post<Budget>(`workspaces/${workspaceId}/budgets`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", workspaceId] });
      toast.success("Budget created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create budget");
    },
  });
}
