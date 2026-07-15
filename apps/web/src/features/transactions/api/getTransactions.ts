import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { TransactionFilterInput } from "@finai/validation";

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  date: string;
  notes: string | null;
  type: "INCOME" | "EXPENSE" | "TRANSFER" | "INVESTMENT";
  categoryId: string;
  category: {
    id: string;
    name: string;
    group: string;
  };
  accountId: string;
  account: {
    id: string;
    name: string;
    type: string;
  };
  toAccountId: string | null;
  toAccount: {
    id: string;
    name: string;
    type: string;
  } | null;
}

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useTransactions(workspaceId: string | null, filter?: TransactionFilterInput) {
  const queryParams = new URLSearchParams();
  if (filter?.search) queryParams.append("search", filter.search);
  if (filter?.category) queryParams.append("category", filter.category);
  if (filter?.account) queryParams.append("account", filter.account);
  if (filter?.type) queryParams.append("type", filter.type);
  if (filter?.dateFrom) queryParams.append("dateFrom", filter.dateFrom);
  if (filter?.dateTo) queryParams.append("dateTo", filter.dateTo);
  if (filter?.page) queryParams.append("page", String(filter.page));
  if (filter?.pageSize) queryParams.append("pageSize", String(filter.pageSize));

  const queryStr = queryParams.toString();
  const endpoint = `workspaces/${workspaceId}/transactions${queryStr ? `?${queryStr}` : ""}`;

  return useQuery<PaginatedTransactions>({
    queryKey: ["transactions", workspaceId, filter],
    queryFn: () => apiClient.get<PaginatedTransactions>(endpoint),
    enabled: !!workspaceId,
  });
}
