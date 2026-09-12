"use client";

import { useMemo } from "react";
import { Check, AlertTriangle, MessagesSquare, Zap } from "lucide-react";
import { Button, cn } from "@finai/ui";
import { MarkdownMessage } from "./MarkdownMessage";
import { ActivityTimeline } from "./ActivityTimeline";
import { FinancialInsight } from "./FinancialInsight";
import { RichConfirmationCard } from "./RichConfirmationCard";
import { BulkConfirmationCard } from "./BulkConfirmationCard";
import { ConfirmationTable } from "./ConfirmationTable";
import type { AgentChatMessage } from "../api/agentTypes";
import { extractFinancialInsight } from "../utils/financialInsight";

const BULK_TOOLS = new Set(["transactions.bulkCreate"]);

function isBulkConfirmation(confirmation: {
  tool: string;
  card: { rows?: [string, string][] };
}): boolean {
  if (!BULK_TOOLS.has(confirmation.tool)) return false;
  const rows = confirmation.card.rows ?? [];
  return rows.some(([key]) => /^#\d+\s+/.test(key));
}

interface AgentRunProps {
  message: AgentChatMessage;
  onConfirmAction: (actionId: string, tool: string) => void;
  onConfirmItem: (actionId: string, tool: string, index: number) => void;
  onConfirmAll: (actions: Array<{ actionId: string; tool: string }>) => void;
  onRejectAction: (actionId: string) => void;
  executingActionId?: string | null;
  /** Index of the transaction row currently being confirmed within a bulk action. */
  executingItemIndex?: number | null;
  /** True when a bulk "Confirm All" action is in progress. */
  isExecutingAll?: boolean;
  /** actionId → indexes whose individual Confirm already succeeded. */
  confirmedItems?: Record<string, number[]>;
}

export function AgentRun({
  message,
  onConfirmAction,
  onConfirmItem,
  onConfirmAll,
  onRejectAction,
  executingActionId,
  executingItemIndex = null,
  isExecutingAll = false,
  confirmedItems = {},
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
      {/* 0. Runtime badge — tells the user which mode produced this reply */}
      {message.mode && (
        <div className="flex justify-end">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
              message.mode === "agent"
                ? "text-primary border-primary/20 bg-primary/5"
                : "text-muted-foreground border-border/70 bg-muted/40",
            )}
          >
            {message.mode === "agent" ? (
              <Zap className="size-3" aria-hidden="true" />
            ) : (
              <MessagesSquare className="size-3" aria-hidden="true" />
            )}
            {message.mode === "agent" ? "Agent mode" : "Advisor mode"}
          </span>
        </div>
      )}

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

      {/* 5. Confirmation cards — individual cards for ≤3, table for >3 */}
      {hasConfirmations &&
        (() => {
          const pendingConfirmations = confirmations!.filter((c) => c.status === "pending");

          // ─── DENSE TABLE VIEW (4+ pending actions) ──────────────────────
          if (pendingConfirmations.length > 3) {
            return (
              <ConfirmationTable
                confirmations={confirmations!}
                onConfirmAll={() => {
                  onConfirmAll(
                    pendingConfirmations.map((c) => ({ actionId: c.actionId, tool: c.tool })),
                  );
                }}
                onConfirmOne={onConfirmAction}
                onRejectOne={onRejectAction}
                executingActionId={executingActionId}
              />
            );
          }

          // ─── INDIVIDUAL CARDS (≤3 pending actions) ─────────────────────
          let firstPendingSeen = false;
          return (
            <div className="space-y-3">
              {confirmations!.map((confirmation) => {
                const isPending = confirmation.status === "pending";
                const disabled = isPending && firstPendingSeen;
                if (isPending) firstPendingSeen = true;
                const isExecuting = executingActionId === confirmation.actionId;

                // Use BulkConfirmationCard for bulk transaction tools
                if (isBulkConfirmation(confirmation)) {
                  return (
                    <BulkConfirmationCard
                      key={confirmation.actionId}
                      confirmation={confirmation}
                      onConfirm={onConfirmAction}
                      onConfirmItem={onConfirmItem}
                      onReject={onRejectAction}
                      executingItemIndex={executingItemIndex}
                      isExecutingAll={isExecutingAll && executingActionId === confirmation.actionId}
                      confirmedItems={confirmedItems}
                    />
                  );
                }

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
              })}

              {/* Confirm All button — only when 2+ pending and none executing */}
              {pendingConfirmations.length >= 2 && !executingActionId && (
                <div className="flex justify-end pt-1">
                  <ConfirmAllButton
                    count={pendingConfirmations.length}
                    onConfirmAll={() => {
                      onConfirmAll(
                        pendingConfirmations.map((c) => ({ actionId: c.actionId, tool: c.tool })),
                      );
                    }}
                  />
                </div>
              )}
            </div>
          );
        })()}
    </div>
  );
}

/**
 * "Confirm All" button rendered below individual cards when the user has
 * 2–3 pending actions. Stands alone so it's easy to spot without
 * interfering with per-card confirm buttons.
 */
function ConfirmAllButton({ count, onConfirmAll }: { count: number; onConfirmAll: () => void }) {
  return (
    <Button variant="outline" size="sm" className="cursor-pointer gap-1.5" onClick={onConfirmAll}>
      <Check className="size-3.5" />
      Confirm All {count} Actions
    </Button>
  );
}
