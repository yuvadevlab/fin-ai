"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@finai/ui";
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
      <SheetContent side="right" className="w-85 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{UI_COPY.ADVISOR.CONTEXT.TITLE}</SheetTitle>
          <SheetDescription>{UI_COPY.ADVISOR.CONTEXT.DESCRIPTION}</SheetDescription>
        </SheetHeader>
        <div className="mt-4">
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
