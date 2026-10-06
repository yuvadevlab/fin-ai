import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "@finai/ui";

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: (id) =>
      toast
        .promise(apiClient.delete<{ deleted: boolean }>(`goals/${id}`), {
          loading: "Deleting goal...",
          success: "Goal deleted successfully",
          error: (error: Error) => error.message || "Failed to delete goal",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
