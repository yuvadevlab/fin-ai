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
      apiClient.patch<Investment>(`investments/${id}/value`, { currentValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Investment market value updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update investment value");
    },
  });
}
