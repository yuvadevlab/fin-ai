"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@fin-ai/ui";
import { ContextPanel } from "./ContextPanel";
import { UI_COPY } from "@/lib/ui-copy";
import type { AgentActivity, AgentConfirmation } from "../api/agentTypes";

export interface AdvisorMobileContextSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickAction: (message: string) => Promise<void>;
  isStreaming: boolean;
  streamingLabel: string;
  pendingConfirmation: AgentConfirmation | null;
  lastRunActivities?: AgentActivity[];
}

export function AdvisorMobileContextSheet({
  open,
  onOpenChange,
  onQuickAction,
  isStreaming,
  streamingLabel,
  pendingConfirmation,
  lastRunActivities,
}: AdvisorMobileContextSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="fn-advisor-mobile-sheet">
        <SheetHeader>
          <SheetTitle>{UI_COPY.ADVISOR.CONTEXT.TITLE}</SheetTitle>
          <SheetDescription>{UI_COPY.ADVISOR.CONTEXT.DESCRIPTION}</SheetDescription>
        </SheetHeader>
        <div className="fn-advisor-mobile-sheet-body">
          <ContextPanel
            onQuickAction={onQuickAction}
            isStreaming={isStreaming}
            streamingLabel={streamingLabel}
            pendingConfirmation={pendingConfirmation}
            lastRunActivities={lastRunActivities}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
