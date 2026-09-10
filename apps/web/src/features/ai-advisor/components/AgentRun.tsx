"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { MarkdownMessage } from "./MarkdownMessage";
import { ActivityTimeline } from "./ActivityTimeline";
import { FinancialInsight } from "./FinancialInsight";
import { RichConfirmationCard } from "./RichConfirmationCard";
import type { AgentChatMessage } from "../api/agentTypes";
import { extractFinancialInsight } from "../utils/financialInsight";

interface AgentRunProps {
  message: AgentChatMessage;
  onConfirmAction: (actionId: string, tool: string) => void;
  onRejectAction: (actionId: string) => void;
  executingActionId?: string | null;
}

export function AgentRun({
  message,
  onConfirmAction,
  onRejectAction,
  executingActionId,
}: AgentRunProps) {
  const {
    text = "",
    activities = [],
    confirmations = [],
    logs = [],
    streaming = false,
    error,
  } = message;
  const hasActivities = activities.length > 0;
  const hasConfirmations = !!confirmations && confirmations.length > 0;

  // Deduplicate: if a prominent financial figure is extracted into the card,
  // render only the remaining text in MarkdownMessage so the heading and amount
  // are never shown twice.
  const insight = useMemo(
    () => (!streaming && !error && text ? extractFinancialInsight(text) : null),
    [streaming, error, text],
  );
  const proseContent = insight?.remainingText ? insight.remainingText : text;

  return (
    <div className="space-y-3">
      {/* 1. Live activity stream with real-time logs & speed ticker */}
      {(hasActivities || streaming || logs.length > 0) && (
        <ActivityTimeline
          activities={activities}
          logs={logs}
          isStreaming={streaming}
          hasText={text.length > 0}
        />
      )}

      {/* 2. Financial insight card */}
      {insight && <FinancialInsight text={text} />}

      {/* 3. Prose response (deduplicated) */}
      {proseContent && (
        <div className="text-sm leading-relaxed">
          <MarkdownMessage content={proseContent} />
        </div>
      )}

      {/* 4. Error block */}
      {error && (
        <div className="border-destructive/30 bg-destructive/10 rounded-xl border p-3.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-destructive text-sm font-semibold">Something went wrong</p>
              <p className="text-destructive/90 mt-0.5 text-xs leading-relaxed">{error}</p>
              <p className="text-muted-foreground mt-1.5 text-xs">
                Your data is unchanged. Check your connection and try again, or rephrase your
                request.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Confirmation cards */}
      {hasConfirmations &&
        (() => {
          let firstPendingSeen = false;
          return confirmations!.map((confirmation) => {
            const isPending = confirmation.status === "pending";
            const disabled = isPending && firstPendingSeen;
            if (isPending) firstPendingSeen = true;
            const isExecuting = executingActionId === confirmation.actionId;
            return (
              <RichConfirmationCard
                key={confirmation.actionId}
                confirmation={confirmation}
                onConfirm={onConfirmAction}
                onReject={onRejectAction}
                disabled={disabled || executingActionId !== null}
                isExecuting={isExecuting}
              />
            );
          });
        })()}
    </div>
  );
}
