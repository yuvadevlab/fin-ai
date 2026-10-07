"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/HistoryDrawer.tsx
 * @description Slide-over history drawer listing past conversational threads with instant switching.
 * @module @finai/web/features/ai-advisor/components/HistoryDrawer
 */

import { MessageSquare, Trash2 } from "lucide-react";
import {
  Button,
  cn,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@finai/ui";
import { UI_COPY, APP_ROUTES } from "@/lib";
import type { AiConversation } from "@/features/ai-advisor";

/** Props configuration for the {@link HistoryDrawer} component */
export interface HistoryDrawerProps {
  /** Controlled open state of the sheet modal */
  open: boolean;
  /** Open change callback for the sheet primitive */
  onOpenChange: (open: boolean) => void;
  /** Array of past conversations fetched from the API */
  conversations: AiConversation[] | undefined;
  /** Active conversation UUID currently rendered in the chat view */
  activeConversationId?: string | null;
  /** Selection handler invoked when clicking an existing thread */
  onSelectConversation: (conversation: AiConversation) => void;
  /** Deletion handler invoked when confirming deletion */
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
}

/**
 * Formats an ISO date string into human-friendly relative time (e.g. '5m ago', '2d ago').
 *
 * @param dateInput - ISO string or Date instance.
 * @returns Formatted relative timestamp string.
 */
function formatRelativeTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/**
 * Slide-over drawer presenting the user's historical AI conversations.
 * Accessible across all screen breakpoints with smooth keyboard and mouse interactions.
 */
export function HistoryDrawer({
  open,
  onOpenChange,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: HistoryDrawerProps) {
  const list = conversations ?? [];
  const isEmpty = list.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{UI_COPY.ADVISOR.DRAWER.TITLE}</SheetTitle>
          <SheetDescription>{UI_COPY.ADVISOR.DRAWER.DESCRIPTION}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-1.5">
          {isEmpty && (
            <p className="text-muted-foreground py-10 text-center text-sm">
              {UI_COPY.ADVISOR.DRAWER.EMPTY}
            </p>
          )}

          {list.map((conversation) => {
            const active = conversation.id === activeConversationId;
            return (
              <div
                key={conversation.id}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {/* Semantic link: preserves browser a11y, middle-click and Cmd+click while enabling 0ms SPA clicks */}
                <a
                  href={APP_ROUTES.ADVISOR_THREAD(conversation.id)}
                  onClick={(e) => {
                    // Check for modifier keys (Cmd/Ctrl/Shift) to preserve browser native open-in-tab behaviors
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                      e.preventDefault();
                      onSelectConversation(conversation);
                    }
                  }}
                  className="focus-visible:ring-ring flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 outline-none focus-visible:ring-1"
                >
                  <MessageSquare className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {conversation.title || UI_COPY.ADVISOR.DRAWER.UNTITLED_CHAT}
                    </span>
                    <span className="text-muted-foreground block text-[11px]">
                      {formatRelativeTime(conversation.updatedAt)}
                    </span>
                  </span>
                </a>

                {/* Hover-reveal delete action */}
                {onDeleteConversation && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 opacity-0 transition group-hover:opacity-100"
                    onClick={(e) => onDeleteConversation(conversation.id, e)}
                    title={UI_COPY.ADVISOR.DRAWER.DELETE_TOOLTIP}
                  >
                    <Trash2 className="text-muted-foreground hover:text-destructive size-3.5" />
                    <span className="sr-only">{UI_COPY.ADVISOR.DRAWER.DELETE_A11Y}</span>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
