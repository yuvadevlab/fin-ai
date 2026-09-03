import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { accountsQueryKey } from "./getAccounts";

async function setDefaultAccount(id: string): Promise<{ success: boolean }> {
  return apiClient.patch<{ success: boolean }>(`accounts/${id}/default`, {});
}

export function useSetDefaultAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setDefaultAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKey() });
    },
  });
}
