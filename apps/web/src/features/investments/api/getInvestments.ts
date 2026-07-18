import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

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

export function useInvestments(workspaceId: string | null) {
  return useQuery<InvestmentsResponse>({
    queryKey: ["investments", workspaceId],
    queryFn: () => apiClient.get<InvestmentsResponse>(`workspaces/${workspaceId}/investments`),
    enabled: !!workspaceId,
  });
}
