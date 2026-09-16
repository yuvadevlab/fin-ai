"use client";

import { Calendar, Check, CreditCard, FileText, Tag, X } from "lucide-react";
import { cn } from "@finai/ui";
import { usePrivacyMode } from "@/hooks";
import type { BulkTransactionItem } from "../utils/parseBulkRows";

export interface BulkConfirmationCardItemProps {
  item: BulkTransactionItem;
  index: number;
  totalCount: number;
  itemStatus: "pending" | "executed" | "rejected";
}

const TYPE_STYLES: Record<string, { badge: string; border: string }> = {
  INCOME: {
    badge: "text-primary bg-primary/10 border-primary/20",
    border: "border-l-primary",
  },
  EXPENSE: {
    badge: "text-destructive bg-destructive/10 border-destructive/20",
    border: "border-l-destructive",
  },
  TRANSFER: {
    badge: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    border: "border-l-amber-500",
  },
  INVESTMENT: {
    badge: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    border: "border-l-blue-500",
  },
  GOAL: {
    badge: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    border: "border-l-purple-500",
  },
};

export function BulkConfirmationCardItem({
  item,
  index,
  totalCount,
  itemStatus,
}: BulkConfirmationCardItemProps) {
  const typeStyle = TYPE_STYLES[item.type.toUpperCase()] ?? TYPE_STYLES.EXPENSE;
  const { isPrivacyMode } = usePrivacyMode();
  const mask = (v: string) => (isPrivacyMode ? "••••••" : v);
  const maskAmount = (v: string) => (isPrivacyMode ? "₹ ••••••" : v);

  return (
    <div
      data-card-index={index}
      className={cn(
        "bg-card border-border/70 min-w-60 flex-1 shrink-0 snap-start rounded-xl border border-l-4 p-3.5 shadow-xs transition-all sm:min-w-67.5",
        typeStyle.border,
        itemStatus === "rejected" && "opacity-60 grayscale-50",
        itemStatus === "executed" && "ring-1 ring-emerald-500/30",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground font-mono text-[11px] font-semibold tracking-wider uppercase">
          #{index + 1} of {totalCount}
        </span>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
            typeStyle.badge,
          )}
        >
          {item.type}
        </span>
      </div>

      <div className="mt-2.5">
        <p className="text-foreground text-lg font-bold tracking-tight tabular-nums">
          {maskAmount(item.amount)}
        </p>
      </div>

      <div className="mt-2.5 space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <Tag className="text-muted-foreground size-3.5 shrink-0" />
          <span className="bg-secondary text-secondary-foreground max-w-44 truncate rounded-full px-2 py-0.5 text-[11px] font-medium">
            {item.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="text-muted-foreground size-3.5 shrink-0" />
          <span className="text-muted-foreground truncate">{mask(item.account)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground size-3.5 shrink-0" />
          <span className="text-muted-foreground truncate">{item.date}</span>
        </div>
        {item.notes && (
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground size-3.5 shrink-0" />
            <span className="text-muted-foreground truncate italic">"{item.notes}"</span>
          </div>
        )}
      </div>

      {/* Status badge — only shown for resolved items */}
      {itemStatus !== "pending" && (
        <div className="border-border/40 mt-3 flex items-center border-t pt-2.5">
          {itemStatus === "executed" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="size-3" /> Recorded
            </span>
          ) : (
            <span className="border-border/60 bg-muted/40 text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
              <X className="size-3" /> Cancelled
            </span>
          )}
        </div>
      )}
    </div>
  );
}
