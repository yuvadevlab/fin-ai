import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { UpdateGoalInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Goal } from "./getGoals";

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, { id: string; input: UpdateGoalInput }>({
    mutationFn: ({ id, input }) =>
      toast
        .promise(apiClient.patch<Goal>(`goals/${id}`, input), {
          loading: "Updating goal...",
          success: "Goal updated successfully",
          error: (error: Error) => error.message || "Failed to update goal",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
