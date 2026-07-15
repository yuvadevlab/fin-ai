import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateGoalInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Goal } from "./getGoals";

export function useCreateGoal(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, CreateGoalInput>({
    mutationFn: (input) => apiClient.post<Goal>(`workspaces/${workspaceId}/goals`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", workspaceId] });
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

export function useContributeGoal(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, ContributeGoalParams>({
    mutationFn: ({ id, amount }) =>
      apiClient.post<Goal>(`workspaces/${workspaceId}/goals/${id}/contribute`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", workspaceId] });
      toast.success("Contribution recorded successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record contribution");
    },
  });
}
