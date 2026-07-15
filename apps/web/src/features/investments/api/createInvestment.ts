import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateInvestmentInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Investment } from "./getInvestments";

export function useCreateInvestment(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Investment, Error, CreateInvestmentInput>({
    mutationFn: (input) =>
      apiClient.post<Investment>(`workspaces/${workspaceId}/investments`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", workspaceId] });
      toast.success("Investment tracked successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to track investment");
    },
  });
}
