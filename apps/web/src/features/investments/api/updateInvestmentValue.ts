import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "@finai/ui";
import { Investment } from "./getInvestments";

export interface UpdateInvestmentValuePayload {
  id: string;
  currentValue: number;
}

export function useUpdateInvestmentValue() {
  const queryClient = useQueryClient();

  return useMutation<Investment, Error, UpdateInvestmentValuePayload>({
    mutationFn: ({ id, currentValue }) =>
      toast
        .promise(apiClient.patch<Investment>(`investments/${id}/value`, { currentValue }), {
          loading: "Updating market value...",
          success: "Investment market value updated",
          error: (error: Error) => error.message || "Failed to update investment value",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
