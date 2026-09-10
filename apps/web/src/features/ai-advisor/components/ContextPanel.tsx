"use client";

import { Bot, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@finai/ui";
import type { AgentActivity, AgentConfirmation } from "../api/agentTypes";
import { activityLabel } from "../utils/deriveRunState";
import { FinancialSnapshot } from "./FinancialSnapshot";
import { QuickActions } from "./QuickActions";

interface ContextPanelProps {
  /** Sends a quick-action message into the conversation. */
  onQuickAction: (message: string) => void;
  /** True while the agent run's SSE stream is open — shows the live block. */
  isStreaming?: boolean;
  /** Current run status label while streaming (from deriveRunState). */
  streamingLabel?: string;
  /** The first pending confirmation, if an action awaits approval. */
  pendingConfirmation?: AgentConfirmation | null;
  /**
   * Activities of the most recent completed run. Only resolved rows with a
   * real server summary contribute to the "Just reviewed" block — the UI
   * never invents numbers.
   */
  lastRunActivities?: AgentActivity[] | undefined;
  className?: string;
}

/**
 * The right-column "Context" workspace panel.
 *
 * It is deliberately *contextual*, not a static dashboard:
 * - While a run is streaming  → live "Agent" status block.
 * - While an action is pending → compact "Action" block (the full editable
 *   confirmation card stays in the conversation — never duplicated here).
 * - After a completed run     → "Just reviewed" list built from the real
 *   tool result summaries.
 * - Always                    → financial snapshot + current context counts
 *   from real API data.
 */
export function ContextPanel({
  onQuickAction,
  isStreaming = false,
  streamingLabel,
  pendingConfirmation,
  lastRunActivities,
  className,
}: ContextPanelProps) {
  // Resolved activities that carried a real result summary, in arrival order.
  const reviewed = (lastRunActivities ?? [])
    .filter((a) => a.status === "success" && a.summary)
    .slice(-4);

  // Compact action context: tool title + the first card rows (real data).
  const actionRows = (pendingConfirmation?.card.rows ?? []).slice(0, 3);
  const showReview = reviewed.length > 0 && !isStreaming;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Quick actions — compact chips */}
      <section aria-label="Quick actions">
        <SectionTitle>Quick actions</SectionTitle>
        <QuickActions onSelect={onQuickAction} className="grid grid-cols-2 gap-2" />
      </section>

      {/* Adaptive: agent is live */}
      {isStreaming && (
        <section aria-live="polite" aria-label="Agent status">
          <SectionTitle>Agent</SectionTitle>
          <div className="bg-primary/5 border-primary/20 border-border/60 flex items-center gap-2.5 rounded-xl border px-3 py-2.5">
            <Loader2 className="text-primary size-4 animate-spin" aria-hidden="true" />
            <span className="text-foreground text-sm font-medium">
              {streamingLabel ?? "FinAI is thinking…"}
            </span>
          </div>
        </section>
      )}

      {/* Adaptive: an action is waiting for approval */}
      {!isStreaming && pendingConfirmation && (
        <section aria-label="Pending action context">
          <SectionTitle>Action</SectionTitle>
          <div className="bg-card border-border/60 rounded-xl border px-3 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0 text-amber-600" aria-hidden="true" />
              <p className="text-foreground min-w-0 flex-1 truncate text-sm font-semibold">
                {pendingConfirmation.card.title ?? "Pending action"}
              </p>
            </div>
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <Bot className="size-3.5" aria-hidden="true" />
              Waiting for your approval
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

      {/* Adaptive: what the last run actually reviewed */}
      {showReview && (
        <section aria-label="Recently reviewed data">
          <SectionTitle>Just reviewed</SectionTitle>
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

      {/* Always-on, real financial context */}
      <section aria-label="Financial snapshot">
        <SectionTitle>Financial snapshot</SectionTitle>
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
