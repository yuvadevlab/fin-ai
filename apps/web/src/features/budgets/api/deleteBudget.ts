import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "@finai/ui";

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: (id) =>
      toast
        .promise(apiClient.delete<{ deleted: boolean }>(`budgets/${id}`), {
          loading: "Deleting budget...",
          success: "Budget deleted successfully",
          error: (error: Error) => error.message || "Failed to delete budget",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
