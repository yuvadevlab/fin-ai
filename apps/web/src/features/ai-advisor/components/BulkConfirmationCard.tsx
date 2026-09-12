"use client";

import { Check, Loader2, ShieldAlert, X } from "lucide-react";
import { Button } from "@finai/ui";
import type { AgentConfirmation } from "../api/agentTypes";
import {
  parseTransactions,
  type ParsedTransaction,
  BulkTransactionTable,
} from "./BulkTransactionTable";

interface BulkConfirmationCardProps {
  confirmation: AgentConfirmation;
  onConfirm: (actionId: string, tool: string) => void;
  onConfirmItem: (actionId: string, tool: string, index: number) => void;
  onReject: (actionId: string) => void;
  executingItemIndex?: number | null;
  isExecutingAll?: boolean;
  /** actionId → indexes whose individual Confirm already succeeded. */
  confirmedItems?: Record<string, number[]>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-foreground text-xs font-medium">{value || "—"}</span>
    </div>
  );
}

function SummaryCard({
  title,
  rows,
  pending,
  isExecuting,
  isExecutingAll,
  onConfirm,
  actionId,
  tool,
  onReject,
}: {
  title: string;
  rows: [string, string | null][];
  pending: boolean;
  isExecuting: boolean;
  isExecutingAll: boolean;
  onConfirm: (actionId: string, tool: string) => void;
  actionId: string;
  tool: string;
  onReject: (actionId: string) => void;
}) {
  return (
    <div className="bg-card ring-border/60 rounded-xl border shadow-sm">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <ShieldAlert className="text-primary size-4 shrink-0" aria-hidden="true" />
        <p className="text-foreground flex-1 text-sm font-semibold">{title}</p>
      </div>
      <div className="border-border/40 divide-border/40 divide-y border-t">
        {rows.map(([key, value]) => (
          <div key={key} className="bg-foreground/2 flex items-center justify-between px-3 py-1.5">
            <span className="text-muted-foreground text-xs">{key}</span>
            <span className="text-foreground text-xs font-medium">{value || "—"}</span>
          </div>
        ))}
      </div>
      <FooterActions
        pending={pending}
        isExecuting={isExecuting}
        isExecutingAll={isExecutingAll}
        onConfirm={() => onConfirm(actionId, tool)}
        onReject={() => onReject(actionId)}
      />
    </div>
  );
}

function FooterActions({
  pending,
  isExecuting,
  isExecutingAll,
  onConfirm,
  onReject,
}: {
  pending: boolean;
  isExecuting: boolean;
  isExecutingAll: boolean;
  onConfirm: () => void;
  onReject: () => void;
}) {
  if (!pending) return null;
  return (
    <div className="border-border/40 flex items-center justify-between gap-2 border-t px-3.5 py-2.5">
      <p className="text-muted-foreground text-[11px]">
        This action has NOT happened yet — confirm to execute.
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="cursor-pointer gap-1.5"
          disabled={isExecuting}
          onClick={onConfirm}
        >
          {isExecutingAll ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Confirming…
            </>
          ) : (
            <>
              <Check className="size-3.5" /> Confirm All
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer gap-1.5"
          disabled={isExecuting}
          onClick={onReject}
        >
          <X className="size-3.5" /> Cancel
        </Button>
      </div>
    </div>
  );
}

function StatusStrip({ status }: { status: AgentConfirmation["status"] }) {
  if (status === "executed")
    return (
      <div className="border-border/40 border-t px-3.5 py-2">
        <span className="text-primary text-xs font-medium">Confirmed &amp; executed</span>
      </div>
    );
  if (status === "rejected")
    return (
      <div className="border-border/40 border-t px-3.5 py-2">
        <span className="text-muted-foreground text-xs">Rejected</span>
      </div>
    );
  if (status === "failed")
    return (
      <div className="border-border/40 border-t px-3.5 py-2">
        <span className="text-destructive text-xs">Failed to execute</span>
      </div>
    );
  return null;
}

export function BulkConfirmationCard({
  confirmation,
  onConfirm,
  onConfirmItem,
  onReject,
  executingItemIndex = null,
  isExecutingAll = false,
  confirmedItems = {},
}: BulkConfirmationCardProps) {
  const { card, status, actionId, tool } = confirmation;
  const pending = status === "pending";
  const isExecuting = executingItemIndex !== null || isExecutingAll;
  /** Indexes of THIS action's items already confirmed individually. */
  const confirmedList = confirmedItems[actionId] ?? [];
  const summaryRows = (card.rows ?? []).filter(([key]) => !key.match(/^#\d+/));
  const transactions = parseTransactions((card.rows ?? []) as [string, string | null][]);

  if (transactions.length === 0) {
    return (
      <SummaryCard
        title={card.title}
        rows={summaryRows}
        pending={pending}
        isExecuting={isExecuting}
        isExecutingAll={isExecutingAll}
        onConfirm={onConfirm}
        actionId={actionId}
        tool={tool}
        onReject={onReject}
      />
    );
  }

  return (
    <div className="bg-card ring-border/60 rounded-xl border shadow-sm">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <ShieldAlert className="text-primary size-4 shrink-0" aria-hidden="true" />
        <p className="text-foreground flex-1 text-sm font-semibold">{card.title}</p>
      </div>

      {summaryRows.length > 0 && (
        <div className="border-border/40 divide-border/40 divide-y border-t">
          {summaryRows.map(([key, value]) => (
            <div
              key={key}
              className="bg-foreground/2 flex items-center justify-between px-3 py-1.5"
            >
              <span className="text-muted-foreground text-xs">{key}</span>
              <span className="text-foreground text-xs font-medium">{value || "—"}</span>
            </div>
          ))}
        </div>
      )}

      {transactions.length <= 3 ? (
        <div className="border-border/40 divide-border/40 divide-y border-t">
          {transactions.map((tx: ParsedTransaction, idx: number) => {
            const isRowExecuting = executingItemIndex === idx;
            return (
              <div key={idx} className="flex items-center justify-between px-3.5 py-2">
                <div className="flex-1">
                  <div className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wider uppercase">
                    Transaction #{idx + 1}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <Field label="Amount" value={tx.amount} />
                    <Field label="Type" value={tx.type} />
                    <Field label="Account" value={tx.account} />
                    <Field label="Category" value={tx.category || "—"} />
                    <Field label="Date" value={tx.date} />
                    {tx.notes && <Field label="Notes" value={tx.notes} />}
                  </div>
                </div>
                {pending && !confirmedList.includes(idx) && (
                  <Button
                    size="sm"
                    className="shrink-0 cursor-pointer gap-1"
                    disabled={isExecuting && !isRowExecuting}
                    onClick={() => onConfirmItem(actionId, tool, idx)}
                  >
                    {isRowExecuting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    Confirm
                  </Button>
                )}
                {pending && confirmedList.includes(idx) && (
                  <span className="text-primary shrink-0 self-center text-xs font-medium">
                    Confirmed ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <BulkTransactionTable
          transactions={transactions}
          pending={pending}
          isExecuting={isExecuting}
          executingItemIndex={executingItemIndex}
          actionId={actionId}
          tool={tool}
          onConfirmItem={onConfirmItem}
          confirmedItems={confirmedList}
        />
      )}

      <FooterActions
        pending={pending}
        isExecuting={isExecuting}
        isExecutingAll={isExecutingAll}
        onConfirm={() => onConfirm(actionId, tool)}
        onReject={() => onReject(actionId)}
      />
      <StatusStrip status={status} />
    </div>
  );
}
