import React from "react";
import { AlertTriangle } from "lucide-react";
import { BudgetStatus } from "@fin-ai/shared-types";
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

  const getBadgeVariantClass = () => {
    if (isOver) return "finai-badge--over";
    if (isAtLimit) return "finai-badge--at-limit";
    if (isWarn) return "finai-badge--near-limit";
    return "finai-badge--on-track";
  };

  return (
    <span className={cn("finai-badge", getBadgeVariantClass(), className)} {...props}>
      {(isOver || isAtLimit) && <AlertTriangle className="fn-icon-xs" />}
      {isOver ? overText : isAtLimit ? limitText : isWarn ? warnText : trackText}
    </span>
  );
}
