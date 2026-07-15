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
  createdAt: string;
  updatedAt: string;
}

export function useInvestments(workspaceId: string | null) {
  return useQuery<Investment[]>({
    queryKey: ["investments", workspaceId],
    queryFn: () => apiClient.get<Investment[]>(`workspaces/${workspaceId}/investments`),
    enabled: !!workspaceId,
  });
}
