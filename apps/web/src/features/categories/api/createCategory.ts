import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateCategoryInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Category } from "./getCategories";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CreateCategoryInput>({
    mutationFn: (input) => apiClient.post<Category>("categories", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}
