import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@fin-ai/shared-types";
import { apiClient } from "@/lib/api-client";
import { CreateCategoryInput } from "@fin-ai/validation";
import { toast } from "@fin-ai/ui";
import { Category } from "./getCategories";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CreateCategoryInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Category>(API_ENDPOINTS.CATEGORIES.BASE, input), {
          loading: "Creating category...",
          success: "Category created successfully",
          error: (error: Error) => error.message || "Failed to create category",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
    },
  });
}
