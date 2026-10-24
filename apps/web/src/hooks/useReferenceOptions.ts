import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS, type ReferenceOption } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";

export const referenceOptionsQueryKey = (category: string) => QUERY_KEYS.OPTIONS.CATEGORY(category);

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
    queryFn: () => apiClient.get<ReferenceOption[]>(API_ENDPOINTS.OPTIONS.CATEGORY(category)),
    staleTime: Infinity,
    select: (data) => data.filter((opt) => opt.isActive),
  });
}
