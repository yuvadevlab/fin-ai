import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
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
        .promise(
          apiClient.patch<Investment>(API_ENDPOINTS.INVESTMENTS.VALUE(id), { currentValue }),
          {
            loading: "Updating market value...",
            success: "Investment market value updated",
            error: (error: Error) => error.message || "Failed to update investment value",
          },
        )
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVESTMENTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.ALL });
    },
  });
}
