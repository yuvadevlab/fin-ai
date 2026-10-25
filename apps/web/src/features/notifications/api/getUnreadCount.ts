import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";

export const unreadNotificationsCountQueryKey = () => QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT;

export function useUnreadNotificationsCount() {
  return useQuery<{ count: number }>({
    queryKey: unreadNotificationsCountQueryKey(),
    queryFn: () => apiClient.get<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
    refetchInterval: 30_000,
  });
}
