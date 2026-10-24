"use client";

import { useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/routes";
import type { AiConversation } from "../api/useConversations";

export interface UseAdvisorThreadSyncOptions {
  conversationId: string | null;
  startNewChat: () => void;
  loadConversation: (id: string) => void;
  scrollToBottom: () => void;
  setHistoryOpen: (open: boolean) => void;
}

export function useAdvisorThreadSync({
  conversationId,
  startNewChat,
  loadConversation,
  scrollToBottom,
  setHistoryOpen,
}: UseAdvisorThreadSyncOptions) {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const rawId = params?.id;
  const routeConversationId = Array.isArray(rawId) ? rawId[0] : rawId;

  const lastLoadedRouteIdRef = useRef<string | null>(null);
  const isNavigatingToNewChatRef = useRef(false);

  const handleNewChat = useCallback(() => {
    isNavigatingToNewChatRef.current = true;
    lastLoadedRouteIdRef.current = null;
    startNewChat();
    setHistoryOpen(false);
    window.history.pushState(null, "", APP_ROUTES.ADVISOR);
    router.replace(APP_ROUTES.ADVISOR, { scroll: false });
  }, [startNewChat, router, setHistoryOpen]);

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
    [conversationId, router, loadConversation, scrollToBottom, setHistoryOpen],
  );

  useEffect(() => {
    if (isNavigatingToNewChatRef.current) {
      if (!routeConversationId) isNavigatingToNewChatRef.current = false;
      return;
    }

    if (routeConversationId && routeConversationId !== lastLoadedRouteIdRef.current) {
      lastLoadedRouteIdRef.current = routeConversationId;
      loadConversation(routeConversationId);
    } else if (!routeConversationId && lastLoadedRouteIdRef.current) {
      lastLoadedRouteIdRef.current = null;
      startNewChat();
    }
  }, [routeConversationId, loadConversation, startNewChat]);

  return {
    routeConversationId,
    handleNewChat,
    handleSelectConversation,
  };
}
