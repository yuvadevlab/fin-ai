import { useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS, SEARCH_PARAMS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";

export const useSuggestEmoji = () => {
  return useMutation<{ emoji: string }, Error, string>({
    mutationFn: async (categoryName: string) => {
      return apiClient.get<{ emoji: string }>(
        `${API_ENDPOINTS.AI.SUGGEST_EMOJI}?${SEARCH_PARAMS.CATEGORY}=${encodeURIComponent(categoryName)}`,
      );
    },
  });
};
