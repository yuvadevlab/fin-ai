"use client";

import { useState } from "react";
import {
  PageContainer,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@finai/ui";
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
    executingActionId,
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
                  executingActionId={executingActionId}
                />
              )}
            </div>
          </div>

          {/* Floating jump to latest message */}
          {!isAtBottom && hasMessages && (
            <button
              type="button"
              onClick={scrollToBottom}
              aria-label="Jump to latest message"
              className="border-border/60 bg-card/95 hover:bg-accent hover:text-accent-foreground absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur-xs transition"
            >
              <ArrowDown
                className={`size-3.5 shrink-0 ${isStreaming ? "text-primary animate-bounce" : ""}`}
                aria-hidden="true"
              />
              <span>{isStreaming ? "New content" : "Jump to latest"}</span>
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

      {/* Context slide-over drawer — tablet & mobile */}
      <Sheet open={contextOpen} onOpenChange={setContextOpen}>
        <SheetContent side="right" className="w-85 overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Financial Context</SheetTitle>
            <SheetDescription>Live workspace snapshot and quick actions.</SheetDescription>
          </SheetHeader>
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
