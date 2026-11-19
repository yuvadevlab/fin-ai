import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@fin-ai/shared-types";
import { apiClient } from "@/lib/api-client";
import { CreateAccountInput } from "@fin-ai/validation";
import { toast } from "@fin-ai/ui";
import { Account, accountsQueryKey } from "./getAccounts";

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation<Account, Error, CreateAccountInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Account>(API_ENDPOINTS.ACCOUNTS.BASE, input), {
          loading: "Linking account...",
          success: "Account linked successfully",
          error: (error: Error) => error.message || "Failed to link account",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKey() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.ALL });
    },
  });
}
