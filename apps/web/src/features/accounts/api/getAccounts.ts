import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface Account {
  id: string;
  name: string;
  type: "BANK" | "CREDIT_CARD" | "WALLET" | "CASH";
  balance: number;
  currency: string;
}

export const accountsQueryKey = (workspaceId: string) => ["accounts", workspaceId] as const;

export function useAccounts(workspaceId: string | null) {
  return useQuery<Account[]>({
    queryKey: accountsQueryKey(workspaceId ?? ""),
    queryFn: () => apiClient.get<Account[]>(`workspaces/${workspaceId}/accounts`),
    enabled: !!workspaceId,
  });
}

export async function prefetchAccounts(
  queryClient: QueryClient,
  workspaceId: string,
  token: string,
) {
  await queryClient.prefetchQuery({
    queryKey: accountsQueryKey(workspaceId),
    queryFn: () => serverFetch<Account[]>(`workspaces/${workspaceId}/accounts`, token),
  });
}
