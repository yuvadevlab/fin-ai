import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { UpdateCategoryInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Category } from "./getCategories";

interface UpdateCategoryParams {
  id: string;
  input: UpdateCategoryInput;
}

export function useUpdateCategory(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, UpdateCategoryParams>({
    mutationFn: ({ id, input }) =>
      apiClient.patch<Category>(`workspaces/${workspaceId}/categories/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", workspaceId] });
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}
