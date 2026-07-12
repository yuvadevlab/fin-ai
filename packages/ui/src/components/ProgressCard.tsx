import React from "react";
import { Progress } from "../primitives/progress";
import { cn } from "../lib/utils";
import { ContentCard } from "./ContentCard";

interface ProgressCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: React.ReactNode;
  value: number;
  target: number;
  unit?: string;
  percentage: number;
  footerLeft?: string;
  footerRight?: string;
  statusBadge?: React.ReactNode;
  progressColorClass?: string;
}

export function ProgressCard({
  title,
  subtitle,
  value,
  target,
  unit = "",
  percentage,
  footerLeft,
  footerRight,
  statusBadge,
  progressColorClass,
  className,
  ...props
}: ProgressCardProps) {
  return (
    <ContentCard className={cn("p-5", className)} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold">{title}</p>
          {subtitle && <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>}
        </div>
        {statusBadge}
      </div>
      <div className="mt-5 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight tabular-nums">
          {unit}
          {value.toLocaleString("en-IN")}
        </span>
        <span className="text-muted-foreground text-sm">
          of {unit}
          {target.toLocaleString("en-IN")}
        </span>
      </div>
      <Progress
        value={Math.min(percentage, 100)}
        className={cn("mt-3 h-1.5", progressColorClass)}
      />
      {(footerLeft || footerRight) && (
        <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
          <span>{footerLeft}</span>
          <span className="font-semibold">{footerRight}</span>
        </div>
      )}
    </ContentCard>
  );
}
