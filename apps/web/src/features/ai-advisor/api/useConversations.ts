import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface AiMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  title: string;
  workspaceId: string;
  createdAt: string;
  messages: AiMessage[];
}

export function useConversations(workspaceId: string | null) {
  return useQuery<AiConversation[]>({
    queryKey: ["ai", "conversations", workspaceId],
    queryFn: () =>
      apiClient.get<AiConversation[]>(
        `ai/conversations${workspaceId ? `?workspaceId=${workspaceId}` : ""}`,
      ),
    enabled: !!workspaceId,
    staleTime: 30_000,
  });
}

export function useConversation(conversationId: string | null) {
  return useQuery<AiConversation>({
    queryKey: ["ai", "conversation", conversationId],
    queryFn: () => apiClient.get<AiConversation>(`ai/conversations/${conversationId}`),
    enabled: !!conversationId,
  });
}
