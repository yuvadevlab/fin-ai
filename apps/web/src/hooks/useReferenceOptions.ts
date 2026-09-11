import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ReferenceOption } from "@finai/shared-types";

export const referenceOptionsQueryKey = (category: string) =>
  ["reference-options", category] as const;

/**
 * Fetches active reference options for a specific category from the database.
 * Options are loaded from `GET /options/:category` and cached infinitely
 * since system reference data rarely changes.
 *
 * @param category - One of "ASSET_CLASS" | "GOAL_TYPE" | "TRANSACTION_TYPE"
 */
export function useReferenceOptions(category: string) {
  return useQuery<ReferenceOption[]>({
    queryKey: referenceOptionsQueryKey(category),
    queryFn: () => apiClient.get<ReferenceOption[]>(`options/${category}`),
    staleTime: Infinity,
    select: (data) => data.filter((opt) => opt.isActive),
  });
}
