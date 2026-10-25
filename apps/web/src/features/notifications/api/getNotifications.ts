import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  data?: Record<string, unknown> | null;
  createdAt: string;
}

export const notificationsQueryKey = () => QUERY_KEYS.NOTIFICATIONS.ALL;

export function useNotifications(limit = 20) {
  return useQuery<NotificationItem[]>({
    queryKey: notificationsQueryKey(),
    queryFn: () =>
      apiClient.get<NotificationItem[]>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}?limit=${limit}`),
    refetchInterval: 30_000,
  });
}
