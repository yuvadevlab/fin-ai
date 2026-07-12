import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "ON_TRACK" | "NEAR_LIMIT" | "OVER" | string;
  overText?: string;
  warnText?: string;
  trackText?: string;
}

export function StatusBadge({
  status,
  overText = "Over limit",
  warnText = "Near limit",
  trackText = "On track",
  className,
  ...props
}: StatusBadgeProps) {
  const isOver = status === "OVER" || status === "over";
  const isWarn = status === "NEAR_LIMIT" || status === "near";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
        isOver
          ? "bg-destructive/10 text-destructive"
          : isWarn
            ? "bg-amber-500/10 text-amber-600"
            : "bg-primary/10 text-primary",
        className,
      )}
      {...props}
    >
      {isOver && <AlertTriangle className="size-3" />}
      {isOver ? overText : isWarn ? warnText : trackText}
    </span>
  );
}
