import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";

export interface SearchTransaction {
  id: string;
  amount: number;
  date: string;
  notes: string | null;
  type: string;
  categoryName: string;
  accountName: string;
}

export interface SearchAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export interface SearchGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface SearchResults {
  transactions: SearchTransaction[];
  accounts: SearchAccount[];
  goals: SearchGoal[];
}

/** Returns a debounced version of `value` (delay in ms). */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useSearch(workspaceId: string | null, query: string) {
  const debouncedQuery = useDebounce(query, 300);
  const enabled = !!workspaceId && debouncedQuery.trim().length >= 2;

  return useQuery<SearchResults>({
    queryKey: ["search", workspaceId, debouncedQuery],
    queryFn: () =>
      apiClient.get<SearchResults>(
        `workspaces/${workspaceId}/search?q=${encodeURIComponent(debouncedQuery.trim())}`,
      ),
    enabled,
    staleTime: 10_000,
  });
}
