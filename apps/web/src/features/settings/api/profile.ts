import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { StorageKey, API_ENDPOINTS, QUERY_KEYS, type UserPreferences } from "@finai/shared-types";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  preferences: UserPreferences;
}

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: QUERY_KEYS.USER.PROFILE,
    queryFn: () => apiClient.get<UserProfile>(API_ENDPOINTS.USERS.PROFILE),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    UserProfile,
    Error,
    { name?: string; email?: string; preferences?: UserPreferences }
  >({
    mutationFn: (input) => apiClient.patch<UserProfile>(API_ENDPOINTS.USERS.PROFILE, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.PROFILE });

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(StorageKey.USER);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const updatedUser = { ...parsed, name: data.name, email: data.email };
            localStorage.setItem(StorageKey.USER, JSON.stringify(updatedUser));
          } catch {
            // Ignore
          }
        }
      }
    },
  });
}
