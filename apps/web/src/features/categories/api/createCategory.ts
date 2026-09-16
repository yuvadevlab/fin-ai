import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateCategoryInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Category } from "./getCategories";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CreateCategoryInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Category>("categories", input), {
          loading: "Creating category...",
          success: "Category created successfully",
          error: (error: Error) => error.message || "Failed to create category",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
