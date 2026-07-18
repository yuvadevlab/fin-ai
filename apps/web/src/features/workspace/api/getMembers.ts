import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
  user: WorkspaceUser;
}

export const getWorkspaceMembersQueryKey = (workspaceId: string | null) => [
  "workspaces",
  workspaceId,
  "members",
];

export function useWorkspaceMembers(workspaceId: string | null) {
  return useQuery<WorkspaceMember[]>({
    queryKey: getWorkspaceMembersQueryKey(workspaceId),
    queryFn: () => apiClient.get<WorkspaceMember[]>(`workspaces/${workspaceId}/members`),
    enabled: !!workspaceId,
  });
}
