import React from "react";
import { cn } from "../lib/utils";
import { ContentCard } from "./ContentCard";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  hint?: string;
  trend?: {
    value: string;
    kind: "up" | "down" | "flat";
  };
  children?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  children,
  className,
  ...props
}: StatCardProps) {
  return (
    <ContentCard className={cn("finai-card--stat", className)} {...props}>
      <div>
        <span className="finai-stat-label">{label}</span>
        <div className="finai-stat-value">{value}</div>
      </div>
      <div className="finai-stat-footer">
        {trend && (
          <span
            className={cn(
              "finai-stat-trend",
              trend.kind === "up" && "finai-stat-trend--up",
              trend.kind === "down" && "finai-stat-trend--down",
              trend.kind === "flat" && "finai-stat-trend--flat",
            )}
          >
            {trend.value}
          </span>
        )}
        {hint && <span className="text-muted-foreground text-[11px]">{hint}</span>}
        {children}
      </div>
    </ContentCard>
  );
}
