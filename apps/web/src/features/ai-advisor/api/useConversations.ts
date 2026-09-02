import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages: AiMessage[];
}

export function useConversations() {
  return useQuery<AiConversation[]>({
    queryKey: ["ai", "conversations"],
    queryFn: () => apiClient.get<AiConversation[]>("ai/conversations"),
    staleTime: 10_000,
  });
}

export function useConversation(conversationId: string | null) {
  return useQuery<AiConversation>({
    queryKey: ["ai", "conversation", conversationId],
    queryFn: () => apiClient.get<AiConversation>(`ai/conversations/${conversationId}`),
    enabled: !!conversationId,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      apiClient.delete<{ success: boolean }>(`ai/conversations/${conversationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
    },
  });
}
