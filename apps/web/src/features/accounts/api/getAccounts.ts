import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface Account {
  id: string;
  name: string;
  type: "BANK" | "CREDIT_CARD" | "WALLET" | "CASH";
  balance: number;
  currency: string;
  isDefault?: boolean;
}

export const accountsQueryKey = () => ["accounts"] as const;

export function useAccounts() {
  return useQuery<Account[]>({
    queryKey: accountsQueryKey(),
    queryFn: () => apiClient.get<Account[]>("accounts"),
  });
}

export async function prefetchAccounts(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: accountsQueryKey(),
    queryFn: () => serverFetch<Account[]>("accounts", token),
  });
}
