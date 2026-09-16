"use client";

import { useState } from "react";
import { History, Info, MessageSquarePlus, PanelRight, Sparkles } from "lucide-react";
import { Button } from "@finai/ui";
import { AdvisorGuideDialog } from "./AdvisorGuideDialog";

interface AdvisorHeaderProps {
  onOpenHistory: () => void;
  onNewChat: () => void;
  onOpenContext: () => void;
  hasMessages: boolean;
}

/**
 * Compact workspace header: agent identity left, controls right.
 *
 * The "Context" toggle only appears below `lg` — on desktop the context
 * panel is permanently docked next to the conversation, on smaller screens
 * it opens as a bottom sheet.
 */
export function AdvisorHeader({
  onOpenHistory,
  onNewChat,
  onOpenContext,
  hasMessages,
}: AdvisorHeaderProps) {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-xl">
            <Sparkles className="text-primary size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-foreground truncate text-base font-semibold tracking-tight">
              AI Advisor
            </h1>
            <p className="text-muted-foreground truncate text-[11px]">
              Your conversational financial assistant
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGuideOpen(true)}
            className="cursor-pointer gap-1.5 text-xs"
            aria-label="How AI Advisor works"
          >
            <Info className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenContext}
            className="cursor-pointer gap-1.5 text-xs lg:hidden"
          >
            <PanelRight className="size-3.5" />
            Context
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="cursor-pointer gap-1.5 text-xs"
          >
            <History className="size-3.5" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNewChat}
            className="cursor-pointer gap-1.5 text-xs"
            disabled={!hasMessages}
          >
            <MessageSquarePlus className="size-3.5" />
            <span className="hidden sm:inline">New chat</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      <AdvisorGuideDialog open={guideOpen} onOpenChange={setGuideOpen} />
    </>
  );
}
