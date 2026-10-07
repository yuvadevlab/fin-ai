import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS, API_ENDPOINTS } from "@finai/shared-types";
import { apiClient } from "@/lib";

export interface AiMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  metadata?: { actionIds?: string[]; runId?: string; [key: string]: unknown } | null;
}

export interface AiConversation {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages: AiMessage[];
}

export function useConversations() {
  return useQuery<AiConversation[]>({
    queryKey: QUERY_KEYS.AI.CONVERSATIONS,
    queryFn: () => apiClient.get<AiConversation[]>(API_ENDPOINTS.AI.CONVERSATIONS),
    staleTime: 10_000,
  });
}

export function useConversation(conversationId: string | null) {
  return useQuery<AiConversation>({
    queryKey: QUERY_KEYS.AI.CONVERSATION(conversationId ?? ""),
    queryFn: () => apiClient.get<AiConversation>(API_ENDPOINTS.AI.CONVERSATION(conversationId!)),
    enabled: !!conversationId,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      apiClient.delete<{ success: boolean }>(API_ENDPOINTS.AI.CONVERSATION(conversationId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AI.CONVERSATIONS });
    },
  });
}
