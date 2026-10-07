"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/AiAdvisorPage.tsx
 * @description Master AI Advisor conversation workspace component.
 * Integrates route-based thread state, zero-latency caching, history drawer, and financial context.
 * @module @finai/web/features/ai-advisor/components/AiAdvisorPage
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PageContainer,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@finai/ui";
import { ArrowDown } from "lucide-react";
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
  type AiConversation,
} from "@/features/ai-advisor";
import { APP_ROUTES } from "@/lib/routes";
import { UI_COPY } from "@/lib/ui-copy";

/**
 * Master interactive conversational workspace for autonomous money management.
 */
export function AiAdvisorPage() {
  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const rawId = params?.id;
  const routeConversationId = Array.isArray(rawId) ? rawId[0] : rawId;
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

  // Navigation locks to avoid Next.js asynchronous router race conditions
  const lastLoadedRouteIdRef = useRef<string | null>(null);
  const isNavigatingToNewChatRef = useRef(false);

  /** Initiates a brand-new conversation thread with instant URL synchronization */
  const handleNewChat = useCallback(() => {
    isNavigatingToNewChatRef.current = true;
    lastLoadedRouteIdRef.current = null;
    startNewChat();
    setHistoryOpen(false);
    window.history.pushState(null, "", APP_ROUTES.ADVISOR);
    router.replace(APP_ROUTES.ADVISOR, { scroll: false });
  }, [startNewChat, router]);

  /** Switches to a past conversation thread using instant zero-latency cache retrieval */
  const handleSelectConversation = useCallback(
    (c: AiConversation) => {
      setHistoryOpen(false);
      if (c.id === conversationId) return;
      isNavigatingToNewChatRef.current = false;
      lastLoadedRouteIdRef.current = c.id;
      window.history.pushState(null, "", APP_ROUTES.ADVISOR_THREAD(c.id));
      router.replace(APP_ROUTES.ADVISOR_THREAD(c.id), { scroll: false });
      loadConversation(c.id);
      scrollToBottom();
    },
    [conversationId, router, loadConversation, scrollToBottom],
  );

  // Synchronize route parameters with active conversation, guarded against async route delays
  useEffect(() => {
    // 1. Guard against in-flight transition to new chat
    if (isNavigatingToNewChatRef.current) {
      if (!routeConversationId) isNavigatingToNewChatRef.current = false;
      return;
    }

    // 2. Synchronize when route ID changes to a new target
    if (routeConversationId && routeConversationId !== lastLoadedRouteIdRef.current) {
      lastLoadedRouteIdRef.current = routeConversationId;
      loadConversation(routeConversationId);
    } else if (!routeConversationId && lastLoadedRouteIdRef.current) {
      lastLoadedRouteIdRef.current = null;
      startNewChat();
    }
  }, [routeConversationId, loadConversation, startNewChat]);

  const hasMessages = messages.length > 0 || !!conversationId || isLoadingConversation;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const currentActivities = lastAssistant?.activities;
  const runState = deriveRunState(currentActivities, isStreaming);
  const pendingConfirmation =
    lastAssistant?.confirmations?.find((c: AgentConfirmation) => c.status === "pending") ?? null;
  const lastRunActivities =
    lastAssistant && !lastAssistant.streaming ? lastAssistant.activities : undefined;

  /** Handles form submission of a user inquiry */
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || isStreaming) return;
    setInput("");
    setContextOpen(false);
    scrollToBottom();
    await sendMessage(q);
  };

  /** Handles quick-action prompt clicks from empty states or context suggestions */
  const handleQuickAction = async (message: string) => {
    if (isStreaming) return;
    setContextOpen(false);
    scrollToBottom();
    await sendMessage(message);
  };

  /** Deletes an existing conversation thread and invalidates local storage cache */
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

      <div className="flex flex-col gap-4 lg:h-[calc(100vh-11rem)] lg:flex-row">
        {/* Primary conversational thread feed */}
        <div className="bg-card ring-border/50 relative flex min-h-[65vh] flex-1 flex-col overflow-hidden rounded-2xl shadow-sm ring-1 lg:h-full lg:min-h-0 lg:min-w-0">
          <div
            className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
            ref={containerRef}
            onScroll={handleScroll}
          >
            <div ref={contentRef}>
              {/* Only show skeleton on cold empty initial load to prevent layout jitter */}
              {isLoadingConversation && messages.length === 0 ? (
                <ChatLoadingSkeleton />
              ) : messages.length === 0 && !isStreaming ? (
                <EmptyState onSelect={handleQuickAction} />
              ) : (
                <ChatMessages
                  messages={messages}
                  onSelectFollowUp={handleQuickAction}
                  onConfirmAction={(id, tool) => confirmAction(id, tool)}
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

        {/* Docked financial snapshot context — desktop only */}
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

      {/* Slide-over financial context drawer — mobile and tablet */}
      <Sheet open={contextOpen} onOpenChange={setContextOpen}>
        <SheetContent side="right" className="w-85 overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{UI_COPY.ADVISOR.CONTEXT.TITLE}</SheetTitle>
            <SheetDescription>{UI_COPY.ADVISOR.CONTEXT.DESCRIPTION}</SheetDescription>
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

      {/* History drawer listing past conversation threads */}
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
