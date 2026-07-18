import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface Investment {
  id: string;
  workspaceId: string;
  name: string;
  assetClass:
    | "MUTUAL_FUND"
    | "STOCK"
    | "FIXED_DEPOSIT"
    | "GOLD"
    | "EPF"
    | "PPF"
    | "REAL_ESTATE"
    | "CRYPTO"
    | "OTHER";
  currentValue: number;
  investedAmount: number;
  allocation?: number;
  value?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentsResponse {
  investments: Investment[];
  totalValue: number;
}

export const investmentsQueryKey = (workspaceId: string) => ["investments", workspaceId] as const;

export function useInvestments(workspaceId: string | null) {
  return useQuery<InvestmentsResponse>({
    queryKey: investmentsQueryKey(workspaceId ?? ""),
    queryFn: () => apiClient.get<InvestmentsResponse>(`workspaces/${workspaceId}/investments`),
    enabled: !!workspaceId,
  });
}

export async function prefetchInvestments(
  queryClient: QueryClient,
  workspaceId: string,
  token: string,
) {
  await queryClient.prefetchQuery({
    queryKey: investmentsQueryKey(workspaceId),
    queryFn: () => serverFetch<InvestmentsResponse>(`workspaces/${workspaceId}/investments`, token),
  });
}
