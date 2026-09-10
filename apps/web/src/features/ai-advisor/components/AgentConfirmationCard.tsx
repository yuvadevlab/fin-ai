"use client";

import { Check, ShieldAlert, X } from "lucide-react";
import { Button } from "@finai/ui";
import type { AgentConfirmation } from "../api";

export interface AgentConfirmationCardProps {
  confirmation: AgentConfirmation;
  onConfirm: (actionId: string, tool: string) => void;
  onReject: (actionId: string) => void;
}

const STATUS_LABEL: Record<AgentConfirmation["status"], string> = {
  pending: "Awaiting your approval",
  executed: "Confirmed and executed",
  rejected: "Rejected",
  failed: "Failed to execute",
};

/**
 * Renders a confirmation card for an agent-proposed write action.
 *
 * The card shows a title, labeled detail rows (type, amount, date, account,
 * category — enriched to human-readable names by the server), and action
 * buttons. While the action status is `pending`, the user can confirm or
 * reject the action; once resolved, the buttons are hidden and the status
 * label reflects the outcome.
 */
export function AgentConfirmationCard({
  confirmation,
  onConfirm,
  onReject,
}: AgentConfirmationCardProps) {
  const { card, status } = confirmation;
  const pending = status === "pending";

  return (
    <div className="bg-card ring-border/60 animate-in slide-in-from-bottom-2 rounded-xl border p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldAlert className="text-primary size-4" aria-hidden="true" />
        <p className="text-foreground flex-1 text-sm font-semibold">{card.title}</p>
        <span className="text-muted-foreground text-[11px] font-medium">
          {STATUS_LABEL[status]}
        </span>
      </div>

      {card.rows && card.rows.length > 0 && (
        <div className="divide-border/60 border-border/60 mt-2 divide-y overflow-hidden rounded-lg border">
          {card.rows.map(([key, value]) => (
            <div
              key={key}
              className="bg-foreground/3 flex items-center justify-between gap-3 px-2.5 py-1.5"
            >
              <span className="text-muted-foreground text-xs">{key}</span>
              <span className="text-foreground max-w-40 truncate text-xs font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}

      {pending && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="cursor-pointer gap-1.5"
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
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
