"use client";

import { Check, Loader2, ShieldAlert, X } from "lucide-react";
import {
  Button,
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@finai/ui";
import type { AgentConfirmation } from "../api/agentTypes";

interface ConfirmationTableProps {
  confirmations: AgentConfirmation[];
  onConfirmAll: () => void;
  onConfirmOne: (actionId: string, tool: string) => void;
  onRejectOne: (actionId: string) => void;
  executingActionId?: string | null;
}

/**
 * Dense table view for 4+ proposed write actions — all visible at once with
 * no scrolling, so the user can compare details and confirm individually or
 * all at once.
 */
export function ConfirmationTable({
  confirmations,
  onConfirmAll,
  onConfirmOne,
  onRejectOne,
  executingActionId,
}: ConfirmationTableProps) {
  const isBusy = executingActionId !== null && executingActionId !== undefined;

  return (
    <div className="bg-card ring-border/60 rounded-xl border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-primary size-4 shrink-0" aria-hidden="true" />
          <p className="text-foreground text-sm font-semibold">
            {confirmations.length} actions awaiting your approval
          </p>
        </div>
        <Button
          size="sm"
          className="cursor-pointer gap-1.5"
          disabled={isBusy}
          onClick={onConfirmAll}
        >
          {isBusy ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Confirming…
            </>
          ) : (
            <>
              <Check className="size-3.5" />
              Confirm All
            </>
          )}
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-45">Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="w-30 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {confirmations.map((c) => {
            const isExecuting = executingActionId === c.actionId;
            const isPending = c.status === "pending";
            const isDisabled = !isPending || isBusy;

            // Build detail string from card rows
            const detailParts: string[] = [];
            if (c.card.rows) {
              for (const [key, value] of c.card.rows) {
                detailParts.push(`${key}: ${value}`);
              }
            }

            return (
              <TableRow key={c.actionId} className={cn(!isPending && "opacity-60")}>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">{c.card.title}</span>
                    <span className="text-muted-foreground text-[11px]">{c.tool}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                    {detailParts.map((part, i) => (
                      <span key={i}>{part}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {isPending && (
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        className="cursor-pointer gap-1"
                        disabled={isDisabled}
                        onClick={() => onConfirmOne(c.actionId, c.tool)}
                      >
                        {isExecuting ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Check className="size-3" />
                        )}
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer gap-1"
                        disabled={isDisabled}
                        onClick={() => onRejectOne(c.actionId)}
                      >
                        <X className="size-3" />
                        Cancel
                      </Button>
                    </div>
                  )}
                  {c.status === "executed" && (
                    <span className="text-primary text-xs font-medium">Confirmed</span>
                  )}
                  {c.status === "rejected" && (
                    <span className="text-muted-foreground text-xs">Rejected</span>
                  )}
                  {c.status === "failed" && (
                    <span className="text-destructive text-xs">Failed</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Footer hint */}
      <div className="px-3.5 py-2">
        <p className="text-muted-foreground text-[11px]">
          None of these actions have happened yet — confirm to execute.
        </p>
      </div>
    </div>
  );
}
