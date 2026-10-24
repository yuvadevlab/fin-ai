import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { UpdateGoalInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Goal } from "./getGoals";

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, { id: string; input: UpdateGoalInput }>({
    mutationFn: ({ id, input }) =>
      toast
        .promise(apiClient.patch<Goal>(API_ENDPOINTS.GOALS.DETAIL(id), input), {
          loading: "Updating goal...",
          success: "Goal updated successfully",
          error: (error: Error) => error.message || "Failed to update goal",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOALS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.ALL });
    },
  });
}
