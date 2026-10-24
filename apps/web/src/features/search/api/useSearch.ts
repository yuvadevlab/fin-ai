import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS, SEARCH_PARAMS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";

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

export function useSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);
  const enabled = debouncedQuery.trim().length >= 2;

  return useQuery<SearchResults>({
    queryKey: QUERY_KEYS.SEARCH.QUERY(debouncedQuery),
    queryFn: () =>
      apiClient.get<SearchResults>(
        `${API_ENDPOINTS.SEARCH.BASE}?${SEARCH_PARAMS.QUERY}=${encodeURIComponent(debouncedQuery.trim())}`,
      ),
    enabled,
    staleTime: 10_000,
  });
}
