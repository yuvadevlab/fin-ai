"use client";

import { Check, Loader2, ShieldAlert, X } from "lucide-react";
import { Button, cn } from "@finai/ui";
import { usePrivacyMode } from "@/hooks";
import type { AgentConfirmation } from "../api/agentTypes";
import { partitionRows } from "../utils/partitionRows";
import { getTransactionTypeAccent, STATUS_META } from "../utils/confirmationCardStyles";
import { BulkConfirmationCarousel } from "./BulkConfirmationCarousel";
import { ConfirmationEffectPreview } from "./ConfirmationEffectPreview";

interface RichConfirmationCardProps {
  confirmation: AgentConfirmation;
  onConfirm: (actionId: string, tool: string) => void;
  onReject: (actionId: string, itemIndex?: number) => void;
  disabled?: boolean;
  isExecuting?: boolean;
}

/**
 * Rich confirmation card for single agent-proposed write action.
 * Supports transaction-type accents (destructive for expense, primary for income, etc.).
 */
export function RichConfirmationCard({
  confirmation,
  onConfirm,
  onReject,
  disabled = false,
  isExecuting = false,
}: RichConfirmationCardProps) {
  const { isPrivacyMode } = usePrivacyMode();

  if (confirmation.card.rows?.[0]?.[0] === "__bulk_count__") {
    return (
      <BulkConfirmationCarousel
        confirmation={confirmation}
        onConfirm={onConfirm}
        onReject={onReject}
        disabled={disabled}
        isExecuting={isExecuting}
      />
    );
  }

  const { card, status } = confirmation;
  const pending = status === "pending";
  const meta = isExecuting
    ? { label: "Executing…", className: "text-amber-500 bg-amber-500/10 border-amber-500/20" }
    : STATUS_META[status];

  const { effectRows, detailRows } = partitionRows(card.rows ?? []);
  const typeAccent = getTransactionTypeAccent(card.rows);

  const SENSITIVE_KEYS =
    /account|balance|amount|limit|salary|income|net\s*worth|total|value|price/i;
  const MONEY_PATTERN = /^[\u20b9$\u20ac\u00a3]|\d[,.]\d/;
  const maskValue = (key: string, value: string): string => {
    if (!isPrivacyMode) return value;
    if (SENSITIVE_KEYS.test(key) || MONEY_PATTERN.test(value))
      return "\u2022\u2022\u2022\u2022\u2022\u2022";
    return value;
  };

  return (
    <div
      className={cn(
        "bg-card ring-border/60 animate-in slide-in-from-bottom-2 rounded-xl border shadow-sm",
        typeAccent?.border,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <ShieldAlert
          className={cn("size-4 shrink-0", typeAccent ? typeAccent.icon : "text-primary")}
          aria-hidden="true"
        />
        <p className="text-foreground flex-1 text-sm font-semibold">{card.title}</p>
        <span
          className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", meta.className)}
        >
          {isExecuting ? (
            <Loader2 className="mr-1 inline-block size-3 animate-spin text-current" />
          ) : pending ? (
            <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-current" />
          ) : null}
          {meta.label}
        </span>
      </div>

      <ConfirmationEffectPreview effectRows={effectRows} maskValue={maskValue} />

      {/* Detail rows */}
      {detailRows.length > 0 && (
        <div
          className={cn(
            "border-border/40 divide-border/40 divide-y overflow-hidden border-t",
            effectRows.length > 0 && "border-t-0",
          )}
        >
          {detailRows.map(([key, value]) => {
            const isTypeKey = key.toLowerCase() === "type";
            return (
              <div
                key={key}
                className="bg-foreground/2 flex items-center justify-between gap-3 px-3 py-1.5"
              >
                <span className="text-muted-foreground text-xs">{key}</span>
                {isTypeKey && typeAccent ? (
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                      typeAccent.badge,
                    )}
                  >
                    {value}
                  </span>
                ) : (
                  <span className="text-foreground max-w-48 truncate text-xs font-medium">
                    {maskValue(key, value)}
                  </span>
                )}
              </div>
            );
          })}
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
              disabled={disabled || isExecuting}
              onClick={() => onConfirm(confirmation.actionId, confirmation.tool)}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Confirming…
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Confirm
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer gap-1.5"
              disabled={disabled || isExecuting}
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
