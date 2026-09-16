import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateInvestmentInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Investment } from "./getInvestments";

export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation<Investment, Error, CreateInvestmentInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Investment>("investments", input), {
          loading: "Adding investment...",
          success: "Investment added successfully",
          error: (error: Error) => error.message || "Failed to add investment",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
