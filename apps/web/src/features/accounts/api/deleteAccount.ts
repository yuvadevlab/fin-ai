import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { accountsQueryKey } from "./getAccounts";

async function deleteAccount(id: string): Promise<{ deleted: boolean }> {
  return apiClient.delete<{ deleted: boolean }>(API_ENDPOINTS.ACCOUNTS.DETAIL(id));
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKey() });
    },
  });
}
