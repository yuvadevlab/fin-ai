import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateAccountInput } from "@finai/validation";
import { toast } from "@finai/ui";
import { Account, accountsQueryKey } from "./getAccounts";

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation<Account, Error, CreateAccountInput>({
    mutationFn: (input) =>
      toast
        .promise(apiClient.post<Account>("accounts", input), {
          loading: "Linking account...",
          success: "Account linked successfully",
          error: (error: Error) => error.message || "Failed to link account",
        })
        .unwrap(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
