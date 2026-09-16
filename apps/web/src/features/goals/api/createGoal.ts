import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateGoalInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Goal } from "./getGoals";

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, CreateGoalInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Goal>("goals", input), {
          loading: "Creating goal...",
          success: "Goal created successfully",
          error: (error: Error) => error.message || "Failed to create goal",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export interface ContributeGoalParams {
  id: string;
  amount: number;
}

export function useContributeGoal() {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, ContributeGoalParams>({
    mutationFn: ({ id, amount }) =>
      toast
        .promise(apiClient.post<Goal>(`goals/${id}/contribute`, { amount }), {
          loading: "Recording contribution...",
          success: "Contribution recorded successfully",
          error: (error: Error) => error.message || "Failed to record contribution",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
