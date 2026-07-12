import React from "react";
import { cn } from "../lib/utils";

interface PercentageBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number | string;
  kind?: "up" | "down" | "flat";
}

export function PercentageBadge({
  value,
  kind = "flat",
  className,
  ...props
}: PercentageBadgeProps) {
  return (
    <span
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
        kind === "up" && "bg-primary/10 text-primary",
        kind === "down" && "bg-destructive/10 text-destructive",
        kind === "flat" && "bg-secondary text-muted-foreground",
        className,
      )}
      {...props}
    >
      {value}
    </span>
  );
}
