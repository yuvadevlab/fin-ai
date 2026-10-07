"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/ContextPanel.tsx
 * @description Docked sidebar panel displaying portfolio snapshot, quick prompts, and action reviews.
 * @module @finai/web/features/ai-advisor/components/ContextPanel
 */

import { Bot, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@finai/ui";
import { UI_COPY } from "@/lib";
import {
  type AgentActivity,
  type AgentConfirmation,
  activityLabel,
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

  // Compact action context: tool title + the first card rows
  const actionRows = (pendingConfirmation?.card.rows ?? []).slice(0, 3);
  const showReview = reviewed.length > 0 && !isStreaming;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Quick actions section */}
      <section aria-label={UI_COPY.ADVISOR.CONTEXT.QUICK_ACTIONS_TITLE}>
        <SectionTitle>{UI_COPY.ADVISOR.CONTEXT.QUICK_ACTIONS_TITLE}</SectionTitle>
        <QuickActions onSelect={onQuickAction} className="grid grid-cols-2 gap-2" />
      </section>

      {/* Adaptive: live agent streaming indicator */}
      {isStreaming && (
        <section aria-live="polite" aria-label={UI_COPY.ADVISOR.CONTEXT.AGENT_STATUS_TITLE}>
          <SectionTitle>{UI_COPY.ADVISOR.CONTEXT.AGENT_STATUS_TITLE}</SectionTitle>
          <div className="bg-primary/5 border-primary/20 flex items-center gap-2.5 rounded-xl border px-3 py-2.5">
            <Loader2 className="text-primary size-4 animate-spin" aria-hidden="true" />
            <span className="text-foreground text-sm font-medium">
              {streamingLabel ?? UI_COPY.ADVISOR.CONTEXT.STREAMING_DEFAULT}
            </span>
          </div>
        </section>
      )}

      {/* Adaptive: action awaiting human clearance */}
      {!isStreaming && pendingConfirmation && (
        <section aria-label={UI_COPY.ADVISOR.CONTEXT.ACTION_TITLE}>
          <SectionTitle>{UI_COPY.ADVISOR.CONTEXT.ACTION_TITLE}</SectionTitle>
          <div className="bg-card border-border/60 rounded-xl border p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0 text-amber-600" aria-hidden="true" />
              <p className="text-foreground min-w-0 flex-1 truncate text-sm font-semibold">
                {pendingConfirmation.card.title ?? UI_COPY.ADVISOR.COMPOSER.PENDING_PREFIX}
              </p>
            </div>
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <Bot className="size-3.5" aria-hidden="true" />
              {UI_COPY.ADVISOR.CONTEXT.WAITING_APPROVAL}
            </span>
            {actionRows.length > 0 && (
              <div className="bg-foreground/2 border-border/40 mt-2.5 space-y-1 border-t pt-2">
                {actionRows.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="text-foreground max-w-40 truncate font-medium">{value}</span>
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
          <ul className="bg-card border-border/60 divide-border/40 space-y-1.5 rounded-xl border px-3 py-2.5 shadow-sm">
            {reviewed.map((a, i) => (
              <li key={`${a.tool}-${i}`} className="flex flex-col gap-0.5">
                <span className="text-foreground text-xs font-medium">{activityLabel(a)}</span>
                <span className="text-muted-foreground truncate text-[11px]">{a.summary}</span>
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
  return (
    <h3 className="text-muted-foreground mb-2 text-[11px] font-bold tracking-wider uppercase">
      {children}
    </h3>
  );
}
