import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateAccountInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Account } from "./getAccounts";

export function useCreateAccount(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Account, Error, CreateAccountInput>({
    mutationFn: (input) => apiClient.post<Account>(`workspaces/${workspaceId}/accounts`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", workspaceId] });
      toast.success("Account linked successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to link account");
    },
  });
}
