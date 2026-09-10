"use client";

import { useState } from "react";
import { PageContainer, Sheet, SheetContent, SheetTitle } from "@finai/ui";
import { ArrowDown } from "lucide-react";
import { useConversations, useDeleteConversation, useAgentChat } from "../api";
import { useChatAutoScroll } from "../hooks/useChatAutoScroll";
import { ChatMessages } from "./ChatMessages";
import { ContextPanel } from "./ContextPanel";
import { AdvisorHeader } from "./AdvisorHeader";
import { AdvisorComposer } from "./AdvisorComposer";
import { EmptyState } from "./EmptyState";
import { HistoryDrawer } from "./HistoryDrawer";
import { deriveRunState } from "../utils/deriveRunState";

/**
 * AI Advisor — FinAI's agentic workspace.
 *
 * Information architecture:
 * - Compact header: identity + History / New chat / Context (mobile).
 * - Conversation (primary, ~70–75% on desktop): user messages, Agent Runs
 *   (live activity → result → confirmation cards), streaming response.
 * - Context panel (~25–30% on desktop): adaptive financial context + quick
 *   actions. On tablet/mobile it becomes a bottom sheet.
 * - History is a right slide-over drawer, never competing with Context.
 *
 * Scrolling: the conversation panel is the single scroll container and owns
 * the auto-scroll policy (`useChatAutoScroll`) — follow the bottom while the
 * user is there, preserve their viewport the moment they scroll away, resume
 * when they return, with an unobtrusive "Jump to latest" chip mid-stream.
 *
 * The agent is powered by `/agent/chat` (SSE) — write actions require
 * explicit user confirmation; the pending action is the source of truth and
 * editable conversationally (never executed by edits).
 */
export function AiAdvisorPage() {
  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const { containerRef, contentRef, isAtBottom, handleScroll, scrollToBottom } =
    useChatAutoScroll();

  const {
    messages,
    isStreaming,
    conversationId,
    sendMessage,
    startNewChat,
    loadConversation,
    stopStreaming,
    confirmAction,
    rejectAction,
  } = useAgentChat();

  const { data: conversations } = useConversations();
  const deleteConversationMutation = useDeleteConversation();

  const hasMessages = messages.length > 0 || !!conversationId;

  // Current-run state (live) and last-completed-run state (context panel).
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const currentActivities = lastAssistant?.activities;
  const runState = deriveRunState(currentActivities, isStreaming);
  const pendingConfirmation =
    lastAssistant?.confirmations?.find((c) => c.status === "pending") ?? null;
  const lastRunActivities =
    lastAssistant && !lastAssistant.streaming ? lastAssistant.activities : undefined;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || isStreaming) return;
    setInput("");
    setContextOpen(false);
    // Sending is the user's own action: re-enable auto-follow and land on the
    // new turn (the ResizeObserver keeps pinning while the answer streams).
    scrollToBottom();
    await sendMessage(q);
  };

  const handleQuickAction = async (message: string) => {
    if (isStreaming) return;
    setContextOpen(false);
    // User-initiated action: re-enable auto-follow (requirement §15).
    scrollToBottom();
    await sendMessage(message);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversationMutation.mutateAsync(id);
    if (conversationId === id) {
      startNewChat();
    }
  };

  return (
    <PageContainer>
      <AdvisorHeader
        onOpenHistory={() => setHistoryOpen(true)}
        onNewChat={() => {
          startNewChat();
          setHistoryOpen(false);
        }}
        onOpenContext={() => setContextOpen(true)}
        hasMessages={hasMessages}
      />

      {/* Workspace: conversation (flex-1) + docked context (lg+) */}
      <div className="flex flex-col gap-4 lg:h-[calc(100vh-11rem)] lg:flex-row">
        {/* Conversation panel */}
        <div className="bg-card ring-border/50 relative flex min-h-[65vh] flex-1 flex-col overflow-hidden rounded-2xl shadow-sm ring-1 lg:h-full lg:min-h-0 lg:min-w-0">
          <div
            className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
            ref={containerRef}
            onScroll={handleScroll}
          >
            <div ref={contentRef}>
              {messages.length === 0 && !isStreaming ? (
                <EmptyState onSelect={handleQuickAction} />
              ) : (
                <ChatMessages
                  messages={messages}
                  onSelectFollowUp={handleQuickAction}
                  onConfirmAction={(actionId, tool) => confirmAction(actionId, tool)}
                  onRejectAction={(actionId) => rejectAction(actionId)}
                />
              )}
            </div>
          </div>

          {/* "Jump to latest" — appears only while streaming & the user has scrolled away.
              Clicking re-enables auto-follow. Never shown when already at bottom. */}
          {isStreaming && !isAtBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              aria-label="Jump to latest message"
              className="border-border/50 bg-card hover:bg-accent hover:text-accent-foreground absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-md transition"
            >
              <ArrowDown className="size-3.5 shrink-0" aria-hidden="true" />
              <span>New content</span>
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

        {/* Docked context — desktop only */}
        <aside
          className="hidden lg:block lg:h-full lg:w-75 lg:min-w-0 lg:shrink-0 lg:overflow-y-auto"
          aria-label="Financial context"
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

      {/* Context bottom sheet — tablet & mobile */}
      <Sheet open={contextOpen} onOpenChange={setContextOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
            Context
          </SheetTitle>
          <div className="mt-4">
            <ContextPanel
              onQuickAction={handleQuickAction}
              isStreaming={isStreaming}
              streamingLabel={runState.statusLabel}
              pendingConfirmation={pendingConfirmation}
              lastRunActivities={lastRunActivities}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* History drawer — every breakpoint */}
      <HistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        conversations={conversations}
        activeConversationId={conversationId}
        onSelectConversation={(c) => {
          loadConversation(c.id);
          setHistoryOpen(false);
          scrollToBottom();
        }}
        onDeleteConversation={handleDeleteConversation}
      />
    </PageContainer>
  );
}
