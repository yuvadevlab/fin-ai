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
    <ContentCard className={cn("p-6", className)} {...props}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <SectionHeader title={title} className="mb-0" />
        {(hint || action) && (
          <div className="flex items-center gap-2">
            {hint && <div className="text-muted-foreground text-xs">{hint}</div>}
            {action}
          </div>
        )}
      </div>
      <div className="w-full">{children}</div>
    </ContentCard>
  );
}
