"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/AiAdvisorPage.tsx
 * @description Master AI Advisor conversation workspace component.
 * Integrates route-based thread state, zero-latency caching, history drawer, and financial context.
 * @module @finai/web/features/ai-advisor/components/AiAdvisorPage
 */

import { useState } from "react";
import { PageContainer } from "@finai/ui";
import { ArrowDown } from "lucide-react";
import { AgentChatRole, AgentConfirmationStatus } from "@finai/shared-types";
import {
  ChatMessages,
  ChatLoadingSkeleton,
  ContextPanel,
  AdvisorHeader,
  AdvisorComposer,
  EmptyState,
  HistoryDrawer,
  useConversations,
  useDeleteConversation,
  removeCachedMessages,
  useAgentChatContext,
  useChatAutoScroll,
  deriveRunState,
  type AgentConfirmation,
} from "@/features/ai-advisor";
import { UI_COPY } from "@/lib/ui-copy";
import { useWorkspace } from "@/providers";
import { ReadOnlyWorkspaceBanner } from "@/components";
import { AdvisorMobileContextSheet } from "./AdvisorMobileContextSheet";
import { useAdvisorThreadSync } from "../hooks/useAdvisorThreadSync";

export function AiAdvisorPage() {
  const { isReadOnly } = useWorkspace();
  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const { containerRef, contentRef, isAtBottom, handleScroll, scrollToBottom } =
    useChatAutoScroll();

  const {
    messages,
    isStreaming,
    isLoadingConversation,
    conversationId,
    executingActionId,
    sendMessage,
    startNewChat,
    loadConversation,
    stopStreaming,
    confirmAction,
    rejectAction,
  } = useAgentChatContext();

  const { data: conversations } = useConversations();
  const deleteConversationMutation = useDeleteConversation();

  const { routeConversationId, handleNewChat, handleSelectConversation } = useAdvisorThreadSync({
    conversationId,
    startNewChat,
    loadConversation,
    scrollToBottom,
    setHistoryOpen,
  });

  const hasMessages = messages.length > 0 || !!conversationId || isLoadingConversation;
  const lastAssistant = [...messages].reverse().find((m) => m.role === AgentChatRole.ASSISTANT);
  const currentActivities = lastAssistant?.activities;
  const runState = deriveRunState(currentActivities, isStreaming);
  const pendingConfirmation =
    lastAssistant?.confirmations?.find(
      (c: AgentConfirmation) => c.status === AgentConfirmationStatus.PENDING,
    ) ?? null;
  const lastRunActivities =
    lastAssistant && !lastAssistant.streaming ? lastAssistant.activities : undefined;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || isStreaming) return;
    setInput("");
    setContextOpen(false);
    scrollToBottom();
    await sendMessage(q);
  };

  const handleQuickAction = async (message: string) => {
    if (isStreaming) return;
    setContextOpen(false);
    scrollToBottom();
    await sendMessage(message);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeCachedMessages(id);
    await deleteConversationMutation.mutateAsync(id);
    if (conversationId === id || routeConversationId === id) handleNewChat();
  };

  return (
    <PageContainer>
      <AdvisorHeader
        onOpenHistory={() => setHistoryOpen(true)}
        onNewChat={handleNewChat}
        onOpenContext={() => setContextOpen(true)}
        hasMessages={hasMessages}
      />
      {isReadOnly && (
        <div className="mb-4">
          <ReadOnlyWorkspaceBanner />
        </div>
      )}

      <div className="flex flex-col gap-4 lg:h-[calc(100vh-11rem)] lg:flex-row">
        <div className="bg-card ring-border/50 relative flex min-h-[65vh] flex-1 flex-col overflow-hidden rounded-2xl shadow-sm ring-1 lg:h-full lg:min-h-0 lg:min-w-0">
          <div
            className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
            ref={containerRef}
            onScroll={handleScroll}
          >
            <div ref={contentRef}>
              {isLoadingConversation && messages.length === 0 ? (
                <ChatLoadingSkeleton />
              ) : messages.length === 0 && !isStreaming ? (
                <EmptyState onSelect={handleQuickAction} />
              ) : (
                <ChatMessages
                  messages={messages}
                  onSelectFollowUp={handleQuickAction}
                  onConfirmAction={(id, tool) => {
                    if (!isReadOnly) confirmAction(id, tool);
                  }}
                  onRejectAction={(id, idx) => rejectAction(id, idx)}
                  executingActionId={executingActionId}
                />
              )}
            </div>
          </div>

          {!isAtBottom && hasMessages && (
            <button
              type="button"
              onClick={scrollToBottom}
              aria-label={UI_COPY.COMMON.A11Y.JUMP_TO_LATEST}
              className="border-border/60 bg-card/95 hover:bg-accent hover:text-accent-foreground absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur-xs transition"
            >
              <ArrowDown
                className={`size-3.5 shrink-0 ${isStreaming ? "text-primary animate-bounce" : ""}`}
                aria-hidden="true"
              />
              <span>
                {isStreaming
                  ? UI_COPY.ADVISOR.FEED.NEW_CONTENT
                  : UI_COPY.ADVISOR.FEED.JUMP_TO_LATEST}
              </span>
            </button>
          )}

          <AdvisorComposer
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isStreaming={isStreaming}
            onStop={stopStreaming}
            activities={currentActivities}
            pendingConfirmation={pendingConfirmation}
          />
        </div>

        <aside
          className="hidden lg:block lg:h-full lg:w-75 lg:min-w-0 lg:shrink-0 lg:overflow-y-auto"
          aria-label={UI_COPY.ADVISOR.CONTEXT.TITLE}
        >
          <ContextPanel
            onQuickAction={handleQuickAction}
            isStreaming={isStreaming}
            streamingLabel={runState.statusLabel}
            pendingConfirmation={pendingConfirmation}
            lastRunActivities={lastRunActivities}
          />
        </aside>
      </div>

      <AdvisorMobileContextSheet
        open={contextOpen}
        onOpenChange={setContextOpen}
        onQuickAction={handleQuickAction}
        isStreaming={isStreaming}
        streamingLabel={runState.statusLabel}
        pendingConfirmation={pendingConfirmation}
        lastRunActivities={lastRunActivities}
      />

      <HistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        conversations={conversations}
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />
    </PageContainer>
  );
}
