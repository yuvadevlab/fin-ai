import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { type UserPreferences } from "@finai/shared-types";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  preferences: UserPreferences;
}

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: () => apiClient.get<UserProfile>("users/profile"),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    UserProfile,
    Error,
    { name?: string; email?: string; preferences?: UserPreferences }
  >({
    mutationFn: (input) => apiClient.patch<UserProfile>("users/profile", input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("finai_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const updatedUser = { ...parsed, name: data.name, email: data.email };
            localStorage.setItem("finai_user", JSON.stringify(updatedUser));
          } catch {
            // Ignore
          }
        }
      }
    },
  });
}
