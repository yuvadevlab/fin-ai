import { QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface Account {
  id: string;
  name: string;
  type: "BANK" | "CREDIT_CARD" | "WALLET" | "CASH";
  balance: number;
  currency: string;
  isDefault?: boolean;
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}

export const accountsQueryKey = () => QUERY_KEYS.ACCOUNTS.ALL;

export function useAccounts() {
  return useQuery<Account[]>({
    queryKey: accountsQueryKey(),
    queryFn: () => apiClient.get<Account[]>(API_ENDPOINTS.ACCOUNTS.BASE),
  });
}

export async function prefetchAccounts(
  queryClient: QueryClient,
  token: string,
  workspaceId?: string,
) {
  await queryClient.prefetchQuery({
    queryKey: accountsQueryKey(),
    queryFn: () => serverFetch<Account[]>(API_ENDPOINTS.ACCOUNTS.BASE, token, workspaceId),
  });
}
