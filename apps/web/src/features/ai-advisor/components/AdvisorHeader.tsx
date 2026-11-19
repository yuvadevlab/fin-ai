"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/AdvisorHeader.tsx
 * @description Compact workspace header displaying agent branding and conversational action controls.
 * @module @fin-ai/web/features/ai-advisor/components/AdvisorHeader
 */

import { useState } from "react";
import { History, Info, MessageSquarePlus, PanelRight, Sparkles } from "lucide-react";
import { Button } from "@fin-ai/ui";
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
      <div className="fn-advisor-header">
        {/* Brand identity */}
        <div className="fn-advisor-header-brand">
          <div className="fn-advisor-header-icon-box">
            <Sparkles className="size-4 shrink-0" aria-hidden="true" />
          </div>
          <div className="fn-advisor-header-titles">
            <h1 className="fn-advisor-header-title">{UI_COPY.ADVISOR.HEADER.TITLE}</h1>
            <p className="fn-advisor-header-badge">{UI_COPY.ADVISOR.HEADER.BADGE}</p>
          </div>
        </div>

        {/* Global conversational actions */}
        <div className="fn-advisor-header-actions">
          {/* Informational guide button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGuideOpen(true)}
            className="fn-advisor-header-btn"
            aria-label={UI_COPY.ADVISOR.HEADER.GUIDE_BUTTON}
            title={UI_COPY.ADVISOR.HEADER.GUIDE_BUTTON}
          >
            <Info className="size-3.5 shrink-0" />
          </Button>

          {/* Context toggle — mobile & tablet viewports */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenContext}
            className="fn-advisor-header-btn lg:hidden"
            aria-label={UI_COPY.ADVISOR.HEADER.CONTEXT_BUTTON}
            title={UI_COPY.ADVISOR.HEADER.CONTEXT_BUTTON}
          >
            <PanelRight className="size-3.5 shrink-0" />
            <span className="fn-advisor-header-btn-label">
              {UI_COPY.ADVISOR.HEADER.CONTEXT_BUTTON}
            </span>
          </Button>

          {/* Past conversations history drawer toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="fn-advisor-header-btn"
            aria-label={UI_COPY.ADVISOR.HEADER.HISTORY_BUTTON}
            title={UI_COPY.ADVISOR.HEADER.HISTORY_BUTTON}
          >
            <History className="size-3.5 shrink-0" />
            <span className="fn-advisor-header-btn-label">
              {UI_COPY.ADVISOR.HEADER.HISTORY_BUTTON}
            </span>
          </Button>

          {/* New chat action button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onNewChat}
            className="fn-advisor-header-btn"
            disabled={!hasMessages}
            aria-label={UI_COPY.ADVISOR.HEADER.NEW_CHAT_BUTTON}
            title={UI_COPY.ADVISOR.HEADER.NEW_CHAT_BUTTON}
          >
            <MessageSquarePlus className="size-3.5 shrink-0" />
            <span className="fn-advisor-header-btn-label">
              {UI_COPY.ADVISOR.HEADER.NEW_CHAT_BUTTON}
            </span>
          </Button>
        </div>
      </div>

      <AdvisorGuideDialog open={guideOpen} onOpenChange={setGuideOpen} />
    </>
  );
}
