import React from "react";
import { Progress } from "@yuva-devlab/ui";
import { cn } from "../lib/utils";
import { ContentCard } from "./ContentCard";

export interface ProgressCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: React.ReactNode;
  value: number;
  target: number;
  unit?: string;
  percentage: number;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  statusBadge?: React.ReactNode;
  actions?: React.ReactNode;
  progressColorClass?: string;
  masked?: boolean;
  maskPlaceholder?: string;
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
  actions,
  progressColorClass,
  masked = false,
  maskPlaceholder = "••••••",
  className,
  ...props
}: ProgressCardProps) {
  const showValueDecimals = Number(Math.abs(value).toFixed(2)) % 1 !== 0;
  const showTargetDecimals = Number(Math.abs(target).toFixed(2)) % 1 !== 0;

  const formattedValue = masked
    ? maskPlaceholder
    : value.toLocaleString("en-IN", {
        minimumFractionDigits: showValueDecimals ? 2 : 0,
        maximumFractionDigits: 2,
      });
  const formattedTarget = masked
    ? maskPlaceholder
    : target.toLocaleString("en-IN", {
        minimumFractionDigits: showTargetDecimals ? 2 : 0,
        maximumFractionDigits: 2,
      });

  return (
    <ContentCard className={cn("p-4 sm:p-5", className)} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold">{title}</p>
          {subtitle && <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5">
          {statusBadge}
          {actions}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-1 sm:mt-5">
        <span className="text-xl font-bold tracking-tight tabular-nums sm:text-2xl">
          {unit}
          {formattedValue}
        </span>
        <span className="text-muted-foreground text-xs sm:text-sm">
          of {unit}
          {formattedTarget}
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
