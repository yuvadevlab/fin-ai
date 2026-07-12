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
    <ContentCard className={cn("flex flex-col justify-between p-5", className)} {...props}>
      <div>
        <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
          {label}
        </span>
        <div className="text-foreground mt-2 text-2xl font-bold tracking-tight">{value}</div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-semibold",
              trend.kind === "up" && "bg-primary/10 text-primary",
              trend.kind === "down" && "bg-destructive/10 text-destructive",
              trend.kind === "flat" && "bg-secondary text-muted-foreground",
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
