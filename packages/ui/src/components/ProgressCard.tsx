import React from "react";
import { Progress } from "@yuva-devlab/ui";
import { cn } from "../lib/utils";
import { ContentCard } from "./ContentCard";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

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
    <ContentCard className={cn("finai-progress-card", className)} {...props}>
      <div className="finai-progress-card-top">
        <div>
          <p className="finai-progress-card-title">{title}</p>
          {subtitle && <p className="finai-progress-card-sub">{subtitle}</p>}
        </div>
        <div className="finai-progress-card-badges">
          {statusBadge}
          {actions}
        </div>
      </div>
      <div className="finai-progress-card-values">
        <span className="finai-progress-card-val">
          {unit}
          {formattedValue}
        </span>
        <span className="finai-progress-card-target">
          {UI_COPY_CONSTANTS.PROGRESS_CARD.OF} {unit}
          {formattedTarget}
        </span>
      </div>
      <Progress
        value={Math.min(percentage, 100)}
        className={cn("finai-progress-card-bar", progressColorClass)}
      />
      {(footerLeft || footerRight) && (
        <div className="finai-progress-card-footer">
          <span>{footerLeft}</span>
          <span className="finai-progress-card-footer-right">{footerRight}</span>
        </div>
      )}
    </ContentCard>
  );
}
