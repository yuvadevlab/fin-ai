import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { CreateInvestmentInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Investment } from "./getInvestments";

export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation<Investment, Error, CreateInvestmentInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Investment>(API_ENDPOINTS.INVESTMENTS.BASE, input), {
          loading: "Adding investment...",
          success: "Investment added successfully",
          error: (error: Error) => error.message || "Failed to add investment",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVESTMENTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.ALL });
    },
  });
}
