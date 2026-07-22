import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export const useSuggestEmoji = () => {
  return useMutation<{ emoji: string }, Error, string>({
    mutationFn: async (categoryName: string) => {
      return apiClient.get<{ emoji: string }>(
        `ai/suggest-emoji?category=${encodeURIComponent(categoryName)}`,
      );
    },
  });
};
