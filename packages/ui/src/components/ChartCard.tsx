import React from "react";
import { cn } from "../lib/utils";
import { ContentCard } from "./ContentCard";
import { SectionHeader } from "./SectionHeader";

export interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function ChartCard({ title, hint, action, children, className, ...props }: ChartCardProps) {
  return (
    <ContentCard className={cn("finai-chart-card", className)} {...props}>
      <div className="finai-chart-card-header">
        <SectionHeader title={title} />
        {(hint || action) && (
          <div className="finai-chart-card-actions">
            {hint && <div className="finai-chart-card-hint">{hint}</div>}
            {action}
          </div>
        )}
      </div>
      <div className="finai-chart-card-body">{children}</div>
    </ContentCard>
  );
}
