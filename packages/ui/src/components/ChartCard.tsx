import React from "react";
import { cn } from "../lib/utils";
import { ContentCard } from "./ContentCard";
import { SectionHeader } from "./SectionHeader";

interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  hint?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, hint, children, className, ...props }: ChartCardProps) {
  return (
    <ContentCard className={cn("p-6", className)} {...props}>
      <div className="mb-4 flex items-center justify-between">
        <SectionHeader title={title} className="mb-0" />
        {hint && <span className="text-muted-foreground text-xs">{hint}</span>}
      </div>
      <div className="w-full">{children}</div>
    </ContentCard>
  );
}
