import { QueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-fetch";

export interface Investment {
  id: string;
  userId: string;
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

export const investmentsQueryKey = () => ["investments"] as const;

export function useInvestments() {
  return useQuery<InvestmentsResponse>({
    queryKey: investmentsQueryKey(),
    queryFn: () => apiClient.get<InvestmentsResponse>("investments"),
  });
}

export async function prefetchInvestments(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: investmentsQueryKey(),
    queryFn: () => serverFetch<InvestmentsResponse>("investments", token),
  });
}
