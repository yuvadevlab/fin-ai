import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Account {
  id: string;
  name: string;
  type: "BANK" | "CREDIT_CARD" | "WALLET" | "CASH";
  balance: number;
  currency: string;
}

export function useAccounts(workspaceId: string | null) {
  return useQuery<Account[]>({
    queryKey: ["accounts", workspaceId],
    queryFn: () => apiClient.get<Account[]>(`workspaces/${workspaceId}/accounts`),
    enabled: !!workspaceId,
  });
}
