import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateInvestmentInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Investment } from "./getInvestments";

export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation<Investment, Error, CreateInvestmentInput>({
    mutationFn: (input) => apiClient.post<Investment>("investments", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Investment added successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add investment");
    },
  });
}
