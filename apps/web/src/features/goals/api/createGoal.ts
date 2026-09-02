import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateGoalInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Goal } from "./getGoals";

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, CreateGoalInput>({
    mutationFn: (input) => apiClient.post<Goal>("goals", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Goal created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create goal");
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
    mutationFn: ({ id, amount }) => apiClient.post<Goal>(`goals/${id}/contribute`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Contribution recorded successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record contribution");
    },
  });
}
