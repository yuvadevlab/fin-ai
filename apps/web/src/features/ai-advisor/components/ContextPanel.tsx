"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/ContextPanel.tsx
 * @description Docked sidebar panel displaying portfolio snapshot, quick prompts, and action reviews.
 * @module @fin-ai/web/features/ai-advisor/components/ContextPanel
 */

import { Bot, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@fin-ai/ui";
import { UI_COPY } from "@/lib";
import {
  type AgentActivity,
  type AgentConfirmation,
  activityLabel,
  getCompactActionRows,
  FinancialSnapshot,
  QuickActions,
} from "@/features/ai-advisor";

/** Props configuration for the {@link ContextPanel} component */
export interface ContextPanelProps {
  /** Sends a quick-action message into the conversation */
  onQuickAction: (message: string) => void;
  /** True while the agent run's SSE stream is open */
  isStreaming?: boolean;
  /** Current run status label while streaming */
  streamingLabel?: string;
  /** The first pending confirmation, if an action awaits approval */
  pendingConfirmation?: AgentConfirmation | null;
  /** Activities of the most recent completed run */
  lastRunActivities?: AgentActivity[] | undefined;
  /** Optional custom CSS class name */
  className?: string;
}

/**
 * Contextual side panel rendering adaptive real-time information:
 * live tool run state during execution, approval summaries during pending confirmations,
 * and current portfolio balances.
 */
export function ContextPanel({
  onQuickAction,
  isStreaming = false,
  streamingLabel,
  pendingConfirmation,
  lastRunActivities,
  className,
}: ContextPanelProps) {
  // Resolved activities that carried a real result summary
  const reviewed = (lastRunActivities ?? [])
    .filter((a) => a.status === "success" && a.summary)
    .slice(-4);

  // Compact action context: sanitized and formatted action rows (no sentinels)
  const actionRows = getCompactActionRows(pendingConfirmation);
  const showReview = reviewed.length > 0 && !isStreaming;

  return (
    <div className={cn("fn-advisor-context", className)}>
      {/* Quick actions section */}
      <section aria-label={UI_COPY.ADVISOR.CONTEXT.QUICK_ACTIONS_TITLE}>
        <SectionTitle>{UI_COPY.ADVISOR.CONTEXT.QUICK_ACTIONS_TITLE}</SectionTitle>
        <QuickActions onSelect={onQuickAction} className="fn-advisor-context-quick" />
      </section>

      {/* Adaptive: live agent streaming indicator */}
      {isStreaming && (
        <section aria-live="polite" aria-label={UI_COPY.ADVISOR.CONTEXT.AGENT_STATUS_TITLE}>
          <SectionTitle>{UI_COPY.ADVISOR.CONTEXT.AGENT_STATUS_TITLE}</SectionTitle>
          <div className="fn-advisor-context-streaming">
            <Loader2 className="fn-advisor-context-streaming-icon" aria-hidden="true" />
            <span className="fn-advisor-context-streaming-text">
              {streamingLabel ?? UI_COPY.ADVISOR.CONTEXT.STREAMING_DEFAULT}
            </span>
          </div>
        </section>
      )}

      {/* Adaptive: action awaiting human clearance */}
      {!isStreaming && pendingConfirmation && (
        <section aria-label={UI_COPY.ADVISOR.CONTEXT.ACTION_TITLE}>
          <SectionTitle>{UI_COPY.ADVISOR.CONTEXT.ACTION_TITLE}</SectionTitle>
          <div className="fn-advisor-context-card">
            <div className="fn-advisor-context-card-header">
              <ShieldCheck className="fn-advisor-context-card-icon" aria-hidden="true" />
              <p className="fn-advisor-context-card-title">
                {pendingConfirmation.card.title ?? UI_COPY.ADVISOR.COMPOSER.PENDING_PREFIX}
              </p>
            </div>
            <span className="fn-advisor-context-card-status">
              <Bot className="fn-advisor-context-card-status-icon" aria-hidden="true" />
              {UI_COPY.ADVISOR.CONTEXT.WAITING_APPROVAL}
            </span>
            {actionRows.length > 0 && (
              <div className="fn-advisor-context-action-list">
                {actionRows.map(([key, value]) => (
                  <div key={key} className="fn-advisor-context-action-row">
                    <span className="fn-advisor-context-action-key">{key}</span>
                    <span className="fn-advisor-context-action-val">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Adaptive: recent completed tool review log */}
      {showReview && (
        <section aria-label={UI_COPY.ADVISOR.CONTEXT.JUST_REVIEWED_TITLE}>
          <SectionTitle>{UI_COPY.ADVISOR.CONTEXT.JUST_REVIEWED_TITLE}</SectionTitle>
          <ul className="fn-advisor-context-review-list">
            {reviewed.map((a, i) => (
              <li key={`${a.tool}-${i}`} className="fn-advisor-context-review-item">
                <span className="fn-advisor-context-review-title">{activityLabel(a)}</span>
                <span className="fn-advisor-context-review-summary">{a.summary}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Always-on financial context */}
      <section aria-label={UI_COPY.ADVISOR.CONTEXT.SNAPSHOT_TITLE}>
        <SectionTitle>{UI_COPY.ADVISOR.CONTEXT.SNAPSHOT_TITLE}</SectionTitle>
        <FinancialSnapshot />
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="fn-advisor-context-title">{children}</h3>;
}
