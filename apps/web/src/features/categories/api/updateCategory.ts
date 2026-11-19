import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@fin-ai/shared-types";
import { apiClient } from "@/lib/api-client";
import { UpdateCategoryInput } from "@fin-ai/validation";
import { toast } from "@fin-ai/ui";
import { Category } from "./getCategories";

interface UpdateCategoryParams {
  id: string;
  input: UpdateCategoryInput;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, UpdateCategoryParams>({
    mutationFn: ({ id, input }) =>
      toast
        .promise(apiClient.patch<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(id), input), {
          loading: "Updating category...",
          success: "Category updated successfully",
          error: (error: Error) => error.message || "Failed to update category",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
    },
  });
}
