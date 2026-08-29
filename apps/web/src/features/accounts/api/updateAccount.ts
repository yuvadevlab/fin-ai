import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Account, accountsQueryKey } from "./getAccounts";
import { UpdateAccountInput } from "@finai/validation";

async function updateAccount(id: string, input: UpdateAccountInput): Promise<Account> {
  return apiClient.patch<Account>(`accounts/${id}`, input);
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAccountInput }) =>
      updateAccount(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKey() });
    },
  });
}
