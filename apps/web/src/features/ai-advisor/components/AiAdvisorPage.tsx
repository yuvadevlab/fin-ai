"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/AiAdvisorPage.tsx
 * @description FinAI Autonomous Advisor powered by @yuva-devlab/agent-ui.
 * @module @fin-ai/web/features/ai-advisor/components/AiAdvisorPage
 */

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PanelRight } from "lucide-react";
import { AgentCardType } from "@yuva-devlab/agent-protocol";
import {
  AgentApprovalState,
  AgentChat,
  AgentChatLayout,
  AgentChatSlot,
  AgentMessageRole,
  type AgentChatMessageItem,
  type AgentThreadAdapter,
} from "@yuva-devlab/agent-ui";
import { Button, PageContainer } from "@fin-ai/ui";
import {
  AgentConfirmationStatus,
  API_ENDPOINTS,
  MessageRole,
  StorageKey,
} from "@fin-ai/shared-types";
import { ReadOnlyWorkspaceBanner } from "@/components";
import {
  confirmAgentAction,
  fetchConversationActions,
  QUICK_ACTIONS,
  rejectAgentAction,
  removeCachedMessages,
  type AiConversation,
} from "@/features/ai-advisor";
import { API_BASE_URL, API_ROUTES, apiClient } from "@/lib";
import { UI_COPY } from "@/lib/ui-copy";
import { useWorkspace } from "@/providers";
import { AdvisorMobileContextSheet } from "./AdvisorMobileContextSheet";

function getFinaiAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const headers: Record<string, string> = {};
  const token =
    localStorage.getItem(StorageKey.TOKEN) ||
    localStorage.getItem(StorageKey.DEVLAB_ACCESS_TOKEN) ||
    localStorage.getItem(StorageKey.DEVLAB_AUTH_TOKEN);
  if (token) headers.Authorization = `Bearer ${token}`;
  const workspaceId = localStorage.getItem(StorageKey.WORKSPACE_ID);
  if (workspaceId) headers["x-workspace-id"] = workspaceId;
  return headers;
}

/** Master AI Advisor page wrapping the reusable @yuva-devlab/agent-ui workspace. */
export function AiAdvisorPage() {
  const { isReadOnly } = useWorkspace();
  const queryClient = useQueryClient();
  const [contextOpen, setContextOpen] = useState(false);

  const handleConfirmAction = useCallback(
    async (actionId: string, approved: boolean) => {
      if (approved) {
        if (isReadOnly) return;
        await confirmAgentAction(actionId);
        await queryClient.invalidateQueries();
      } else {
        await rejectAgentAction(actionId);
      }
    },
    [isReadOnly, queryClient],
  );

  const transport = useMemo(
    () => ({
      streamUrl: `${API_BASE_URL}/${API_ROUTES.AGENT_CHAT}`,
      appSlug: "fin-ai",
      profileSlug: "finai-advisor",
      headers: getFinaiAuthHeaders,
      buildBody: ({ prompt, threadId }: { prompt: string; threadId?: string }) => ({
        question: prompt,
        conversationId: threadId,
      }),
      onConfirmAction: handleConfirmAction,
    }),
    [handleConfirmAction],
  );

  const threadAdapter = useMemo<AgentThreadAdapter>(
    () => ({
      listThreads: async () => {
        const list = await apiClient.get<AiConversation[]>(API_ENDPOINTS.AI.CONVERSATIONS);
        return list.map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt }));
      },
      loadThread: async (threadId: string) => {
        const [convo, actions] = await Promise.all([
          apiClient.get<AiConversation>(API_ENDPOINTS.AI.CONVERSATION(threadId)),
          fetchConversationActions(threadId).catch(() => []),
        ]);
        const mapped: AgentChatMessageItem[] = (convo.messages ?? []).map((m) => ({
          id: m.id,
          role: m.role === MessageRole.USER ? AgentMessageRole.USER : AgentMessageRole.ASSISTANT,
          content: m.content,
          createdAt: m.createdAt,
        }));
        const lastAssistant = [...mapped]
          .reverse()
          .find((m) => m.role === AgentMessageRole.ASSISTANT);
        if (lastAssistant && actions.length > 0) {
          lastAssistant.confirmations = actions.map((a) => ({
            actionId: a.actionId,
            tool: a.tool,
            card: { type: AgentCardType.CONFIRMATION, title: a.card.title, rows: a.card.rows },
            state:
              a.status === AgentConfirmationStatus.EXECUTED
                ? AgentApprovalState.ACCEPTED
                : a.status === AgentConfirmationStatus.REJECTED
                  ? AgentApprovalState.REJECTED
                  : AgentApprovalState.REQUESTED,
          }));
        }
        return mapped;
      },
      deleteThread: async (threadId: string) => {
        removeCachedMessages(threadId);
        await apiClient.delete<{ success: boolean }>(API_ENDPOINTS.AI.CONVERSATION(threadId));
      },
    }),
    [],
  );

  const starterPrompts = useMemo(() => QUICK_ACTIONS.map((q) => q.message), []);

  const copy = useMemo(
    () => ({
      defaultTitle: UI_COPY.ADVISOR.HEADER.TITLE,
      newThread: UI_COPY.ADVISOR.HEADER.NEW_CHAT_BUTTON,
      searchThreadsPlaceholder: UI_COPY.ADVISOR.DRAWER.TITLE,
      noThreads: UI_COPY.ADVISOR.DRAWER.EMPTY,
      untitledThread: UI_COPY.ADVISOR.DRAWER.UNTITLED_CHAT,
      emptyTitle: UI_COPY.ADVISOR.EMPTY_STATE.TITLE,
      emptyDescription: UI_COPY.ADVISOR.EMPTY_STATE.SUBTITLE,
      composerPlaceholder: UI_COPY.ADVISOR.COMPOSER.PLACEHOLDER,
      thinkingLabel: UI_COPY.ADVISOR.ACTIVITY_TIMELINE.THINKING,
      thoughtProcessLabel: UI_COPY.ADVISOR.ACTIVITY_TIMELINE.HEADER_TITLE,
      approveLabel: UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.CONFIRM_SINGLE,
      rejectLabel: UI_COPY.ADVISOR.CONFIRMATION_CAROUSEL.CANCEL_SINGLE,
      approvedLabel: UI_COPY.ADVISOR.CONFIRMATION_STATUS.RECORDED,
      rejectedLabel: UI_COPY.ADVISOR.CONFIRMATION_STATUS.CANCELLED,
      scrollToBottomLabel: UI_COPY.ADVISOR.FEED.JUMP_TO_LATEST,
      streamErrorFallback: UI_COPY.ADVISOR.ERROR_DESCRIPTION,
    }),
    [],
  );

  return (
    <PageContainer fillViewport>
      <div className="fn-agent-chat-shell">
        {isReadOnly && (
          <div className="fn-advisor-banner-wrap">
            <ReadOnlyWorkspaceBanner />
          </div>
        )}

        <AgentChat
          transport={transport}
          threadAdapter={threadAdapter}
          layout={AgentChatLayout.EMBEDDED}
          showSidebar
          showTraceInspector
          starterPrompts={starterPrompts}
          copy={copy}
          classNames={{ [AgentChatSlot.ROOT]: "fn-agent-chat-root" }}
          renderers={{
            renderHeaderActions: () => (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setContextOpen(true)}
              >
                <PanelRight size={14} /> {UI_COPY.ADVISOR.HEADER.CONTEXT_BUTTON}
              </Button>
            ),
          }}
        />
      </div>

      <AdvisorMobileContextSheet
        open={contextOpen}
        onOpenChange={setContextOpen}
        isStreaming={false}
        streamingLabel={UI_COPY.ADVISOR.CONTEXT.STREAMING_DEFAULT}
        pendingConfirmation={null}
        onQuickAction={async () => {
          setContextOpen(false);
        }}
      />
    </PageContainer>
  );
}
