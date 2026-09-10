"use client";

import { Check, ShieldAlert, X } from "lucide-react";
import { Button, cn } from "@finai/ui";
import type { AgentConfirmation } from "../api/agentTypes";

interface RichConfirmationCardProps {
  confirmation: AgentConfirmation;
  onConfirm: (actionId: string, tool: string) => void;
  onReject: (actionId: string) => void;
  /**
   * When true, the confirm button is disabled and shows a hint explaining
   * that earlier actions must be confirmed first. Used to enforce sequential
   * confirmation when later actions depend on earlier ones (e.g. a transaction
   * that references a category the agent is also proposing to create).
   */
  disabled?: boolean;
}

const STATUS_META: Record<AgentConfirmation["status"], { label: string; className: string }> = {
  pending: {
    label: "Awaiting your approval",
    className: "text-primary bg-primary/10 border-primary/20",
  },
  executed: {
    label: "Confirmed & executed",
    className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    className: "text-muted-foreground bg-muted/40 border-border/60",
  },
  failed: {
    label: "Failed to execute",
    className: "text-destructive bg-destructive/10 border-destructive/20",
  },
};

/**
 * Improved confirmation card for an agent-proposed write action.
 *
 * Shows the action title, enriched detail rows (entity names resolved by the
 * server), before/after effect when rows contain comparable values, and
 * confirm/reject actions while pending.
 *
 * Before/after is derived conservatively: if rows contain paired keys like
 * "Current limit" / "New limit" or "Before" / "After", we render them as an
 * effect preview. Otherwise we just list the rows.
 */
export function RichConfirmationCard({
  confirmation,
  onConfirm,
  onReject,
  disabled = false,
}: RichConfirmationCardProps) {
  const { card, status } = confirmation;
  const pending = status === "pending";
  const meta = STATUS_META[status];

  // Detect before/effect pairs in the rows.
  const { effectRows, detailRows } = partitionRows(card.rows ?? []);

  return (
    <div className="bg-card ring-border/60 animate-in slide-in-from-bottom-2 rounded-xl border shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <ShieldAlert className="text-primary size-4 shrink-0" aria-hidden="true" />
        <p className="text-foreground flex-1 text-sm font-semibold">{card.title}</p>
        <span
          className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", meta.className)}
        >
          {pending && (
            <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-current" />
          )}
          {meta.label}
        </span>
      </div>

      {/* Effect preview (before → after) when available */}
      {effectRows.length > 0 && (
        <div className="border-border/40 border-t px-3.5 py-2.5">
          <div className="flex items-center gap-3">
            {effectRows.map(([key, value], idx) => (
              <div key={key} className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-muted-foreground text-[11px] font-medium uppercase">{key}</p>
                  <p className="text-foreground mt-0.5 text-sm font-semibold tabular-nums">
                    {value}
                  </p>
                </div>
                {idx < effectRows.length - 1 && (
                  <span className="text-muted-foreground text-lg">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail rows */}
      {detailRows.length > 0 && (
        <div
          className={cn(
            "border-border/40 divide-border/40 divide-y overflow-hidden border-t",
            effectRows.length > 0 && "border-t-0",
          )}
        >
          {detailRows.map(([key, value]) => (
            <div
              key={key}
              className="bg-foreground/2 flex items-center justify-between gap-3 px-3 py-1.5"
            >
              <span className="text-muted-foreground text-xs">{key}</span>
              <span className="text-foreground max-w-48 truncate text-xs font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions — only while pending */}
      {pending && (
        <div className="flex flex-col gap-1.5 px-3.5 py-2.5">
          {disabled && (
            <p className="text-muted-foreground text-[11px] font-medium">
              Confirm the previous action first — this action depends on it.
            </p>
          )}
          <p className="text-muted-foreground text-[11px] font-medium">
            This action has NOT happened yet — confirm to execute.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="cursor-pointer gap-1.5"
              disabled={disabled}
              onClick={() => onConfirm(confirmation.actionId, confirmation.tool)}
            >
              <Check className="size-3.5" />
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer gap-1.5"
              onClick={() => onReject(confirmation.actionId)}
            >
              <X className="size-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Partitions card rows into before/after effect pairs vs plain detail rows.
 * Recognized effect keys: "Before/After", "Old/New limit", "Current/New".
 */
function partitionRows(cardRows: [string, string][]): {
  effectRows: [string, string][];
  detailRows: [string, string][];
} {
  const effectPairs = [
    ["before", "after"],
    ["old limit", "new limit"],
    ["old balance", "new balance"],
    ["current", "new"],
    ["from", "to"],
  ];

  const rows = cardRows ?? [];
  const used = new Set<number>();
  const effectRows: [string, string][] = [];

  for (const [lowHigh, highKey] of effectPairs) {
    const lowIdx = rows.findIndex(
      ([k], i) =>
        !used.has(i) &&
        k.toLowerCase().includes(lowHigh) &&
        !k.toLowerCase().includes("account") &&
        !k.toLowerCase().includes("category"),
    );
    const highIdx = rows.findIndex(([k], i) => !used.has(i) && k.toLowerCase().includes(highKey));
    if (lowIdx !== -1 && highIdx !== -1) {
      effectRows.push(rows[lowIdx], rows[highIdx]);
      used.add(lowIdx).add(highIdx);
      break; // only one effect pair per card
    }
  }

  const detailRows = rows.filter((_, i) => !used.has(i));
  return { effectRows, detailRows };
}
