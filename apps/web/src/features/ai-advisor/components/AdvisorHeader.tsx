"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/AdvisorHeader.tsx
 * @description Compact workspace header displaying agent branding and conversational action controls.
 * @module @finai/web/features/ai-advisor/components/AdvisorHeader
 */

import { useState } from "react";
import { History, Info, MessageSquarePlus, PanelRight, Sparkles } from "lucide-react";
import { Button } from "@finai/ui";
import { UI_COPY } from "@/lib";
import { AdvisorGuideDialog } from "./AdvisorGuideDialog";

/** Props configuration for the {@link AdvisorHeader} component */
export interface AdvisorHeaderProps {
  /** Handler to open the history slide-over drawer */
  onOpenHistory: () => void;
  /** Handler to start a fresh conversation session */
  onNewChat: () => void;
  /** Handler to open the context sheet on mobile/tablet viewports */
  onOpenContext: () => void;
  /** Whether active messages or a conversation thread exist */
  hasMessages: boolean;
}

/**
 * Workspace header providing agent identity branding and global conversational controls.
 *
 * @param props - Component configuration properties.
 * @returns Rendered header element.
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
        {/* Brand identity */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-xl">
            <Sparkles className="text-primary size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-foreground truncate text-base font-semibold tracking-tight">
              {UI_COPY.ADVISOR.HEADER.TITLE}
            </h1>
            <p className="text-muted-foreground truncate text-[11px]">
              {UI_COPY.ADVISOR.HEADER.BADGE}
            </p>
          </div>
        </div>

        {/* Global conversational actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Informational guide button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGuideOpen(true)}
            className="cursor-pointer gap-1.5 text-xs"
            aria-label={UI_COPY.ADVISOR.HEADER.GUIDE_BUTTON}
          >
            <Info className="size-3.5" />
          </Button>

          {/* Context toggle — mobile & tablet viewports */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenContext}
              className="cursor-pointer gap-1.5 text-xs lg:hidden!"
            >
              <PanelRight className="size-3.5" />
              {UI_COPY.ADVISOR.HEADER.CONTEXT_BUTTON}
            </Button>
          </div>

          {/* Past conversations history drawer toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="cursor-pointer gap-1.5 text-xs"
          >
            <History className="size-3.5" />
            <span className="hidden sm:inline">{UI_COPY.ADVISOR.HEADER.HISTORY_BUTTON}</span>
          </Button>

          {/* New chat action button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onNewChat}
            className="cursor-pointer gap-1.5 text-xs"
            disabled={!hasMessages}
          >
            <MessageSquarePlus className="size-3.5" />
            <span className="hidden sm:inline">{UI_COPY.ADVISOR.HEADER.NEW_CHAT_BUTTON}</span>
            <span className="sm:hidden">{UI_COPY.COMMON.ACTIONS.OPEN}</span>
          </Button>
        </div>
      </div>

      <AdvisorGuideDialog open={guideOpen} onOpenChange={setGuideOpen} />
    </>
  );
}
