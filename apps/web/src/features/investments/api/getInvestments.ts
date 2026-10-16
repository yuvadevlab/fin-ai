import { QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
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

export const investmentsQueryKey = () => QUERY_KEYS.INVESTMENTS.ALL;

export function useInvestments() {
  return useQuery<InvestmentsResponse>({
    queryKey: investmentsQueryKey(),
    queryFn: () => apiClient.get<InvestmentsResponse>(API_ENDPOINTS.INVESTMENTS.BASE),
  });
}

export async function prefetchInvestments(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: investmentsQueryKey(),
    queryFn: () => serverFetch<InvestmentsResponse>(API_ENDPOINTS.INVESTMENTS.BASE, token),
  });
}
