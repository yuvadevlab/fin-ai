import React from "react";
import { AlertTriangle } from "lucide-react";
import { BudgetStatus } from "@finai/shared-types";
import { cn } from "../lib/utils";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: BudgetStatus | string;
  overText?: string;
  limitText?: string;
  warnText?: string;
  trackText?: string;
}

export function StatusBadge({
  status,
  overText = "Over limit",
  limitText = "Limit reached",
  warnText = "Near limit",
  trackText = "On track",
  className,
  ...props
}: StatusBadgeProps) {
  const isOver = status === BudgetStatus.OVER || status === "over";
  const isAtLimit = status === BudgetStatus.AT_LIMIT || status === "at_limit" || status === "limit";
  const isWarn = status === BudgetStatus.NEAR_LIMIT || status === "near";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
        isOver
          ? "bg-destructive/10 text-destructive"
          : isAtLimit
            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
            : isWarn
              ? "bg-amber-500/10 text-amber-600"
              : "bg-primary/10 text-primary",
        className,
      )}
      {...props}
    >
      {(isOver || isAtLimit) && <AlertTriangle className="size-3" />}
      {isOver ? overText : isAtLimit ? limitText : isWarn ? warnText : trackText}
    </span>
  );
}
