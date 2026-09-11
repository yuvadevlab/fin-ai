"use client";

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
import type { AiConversation } from "../api/useConversations";

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: AiConversation[] | undefined;
  activeConversationId?: string | null;
  onSelectConversation: (conversation: AiConversation) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
}

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
 * Slide-over list of past conversations (Sheet primitive). Opened from the
 * header "History" button on every breakpoint — it never competes with the
 * contextual right panel.
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
          <SheetTitle>Past Conversations</SheetTitle>
          <SheetDescription>Resume where you left off.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-1.5">
          {isEmpty && (
            <p className="text-muted-foreground py-10 text-center text-sm">No conversations yet.</p>
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
                <button
                  type="button"
                  onClick={() => onSelectConversation(conversation)}
                  className="focus-visible:ring-ring flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 outline-none focus-visible:ring-1"
                >
                  <MessageSquare className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {conversation.title || "Untitled chat"}
                    </span>
                    <span className="text-muted-foreground block text-[11px]">
                      {formatRelativeTime(conversation.updatedAt)}
                    </span>
                  </span>
                </button>
                {onDeleteConversation && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 opacity-0 transition group-hover:opacity-100"
                    onClick={(e) => onDeleteConversation(conversation.id, e)}
                    title="Delete chat"
                  >
                    <Trash2 className="text-muted-foreground hover:text-destructive size-3.5" />
                    <span className="sr-only">Delete conversation</span>
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
