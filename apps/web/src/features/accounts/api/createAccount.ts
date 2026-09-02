import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateAccountInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Account, accountsQueryKey } from "./getAccounts";

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation<Account, Error, CreateAccountInput>({
    mutationFn: (input) => apiClient.post<Account>("accounts", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Account linked successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to link account");
    },
  });
}
