import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@finai/shared-types";
import { apiClient } from "@/lib/api-client";
import { notificationsQueryKey } from "./getNotifications";
import { unreadNotificationsCountQueryKey } from "./getUnreadCount";

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation<{ count: number }, Error, void>({
    mutationFn: () => apiClient.post<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS.READ_ALL),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey() });
      queryClient.invalidateQueries({ queryKey: unreadNotificationsCountQueryKey() });
    },
  });
}
