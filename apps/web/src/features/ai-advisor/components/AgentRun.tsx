"use client";

import { AlertTriangle } from "lucide-react";
import { MarkdownMessage } from "./MarkdownMessage";
import { ActivityTimeline } from "./ActivityTimeline";
import { FinancialInsight } from "./FinancialInsight";
import { RichConfirmationCard } from "./RichConfirmationCard";
import type { AgentChatMessage } from "../api/agentTypes";

interface AgentRunProps {
  message: AgentChatMessage;
  onConfirmAction: (actionId: string, tool: string) => void;
  onRejectAction: (actionId: string) => void;
}

/**
 * A single assistant turn, composed of:
 * 1. Run progress (grouped tool activity) — full step list for the current
 *    turn (including the phase before any tool call arrives), compact status
 *    chip for older turns so activity history stays visible.
 * 2. Optional financial insight card — when the response opens with a clear
 *    structured figure.
 * 3. The prose response (markdown).
 * 4. Confirmation cards for any proposed write actions.
 * 5. Error/recovery block when the run failed.
 *
 * This replaces the scattered "chips below a bubble" pattern with a coherent
 * run that tells the user what the agent did and what it concluded.
 */
export function AgentRun({ message, onConfirmAction, onRejectAction }: AgentRunProps) {
  const { text = "", activities = [], confirmations = [], streaming = false, error } = message;
  const hasActivities = activities.length > 0;
  const hasConfirmations = !!confirmations && confirmations.length > 0;

  return (
    <div className="space-y-3">
      {/* 1. Live activity stream — collapsed summary while running and after
          completion (status · step count · elapsed time), fully expandable at
          any time. Every row originates from a real SSE event. */}
      {(hasActivities || streaming) && (
        <ActivityTimeline
          activities={activities}
          isStreaming={streaming}
          hasText={text.length > 0}
        />
      )}

      {/* 2. Financial insight (structured leading figure) */}
      {!streaming && !error && text && <FinancialInsight text={text} />}

      {/* 3. Prose response */}
      {text && (
        <div className="text-sm leading-relaxed">
          <MarkdownMessage content={text} />
        </div>
      )}

      {/* 4. Error / recovery block */}
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

      {/* 5. Confirmation cards — sequential: only the first pending card is
          enabled so the user confirms interdependent actions in order
          (e.g. create the category before the transaction that uses it). */}
      {hasConfirmations &&
        (() => {
          let firstPendingSeen = false;
          return confirmations!.map((confirmation) => {
            const isPending = confirmation.status === "pending";
            const disabled = isPending && firstPendingSeen;
            if (isPending) firstPendingSeen = true;
            return (
              <RichConfirmationCard
                key={confirmation.actionId}
                confirmation={confirmation}
                onConfirm={onConfirmAction}
                onReject={onRejectAction}
                disabled={disabled}
              />
            );
          });
        })()}
    </div>
  );
}
