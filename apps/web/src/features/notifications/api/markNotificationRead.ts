import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { notificationsQueryKey, NotificationItem } from "./getNotifications";
import { unreadNotificationsCountQueryKey } from "./getUnreadCount";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation<NotificationItem, Error, string>({
    mutationFn: (id) => apiClient.patch<NotificationItem>(API_ENDPOINTS.NOTIFICATIONS.READ(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey() });
      queryClient.invalidateQueries({ queryKey: unreadNotificationsCountQueryKey() });
    },
  });
}
