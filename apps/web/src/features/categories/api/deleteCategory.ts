import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "@finai/ui";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: (id) =>
      toast
        .promise(apiClient.delete<{ deleted: boolean }>(`categories/${id}`), {
          loading: "Deleting category...",
          success: "Category deleted successfully",
          error: (error: Error) => error.message || "Failed to delete category",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
