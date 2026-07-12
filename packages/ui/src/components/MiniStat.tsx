import React from "react";
import { cn } from "../lib/utils";
import { ContentCard } from "./ContentCard";

interface MiniStatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
}

export function MiniStat({ label, value, sub, icon, className, ...props }: MiniStatProps) {
  return (
    <ContentCard className={cn("flex items-center justify-between p-5", className)} {...props}>
      <div className="space-y-1">
        <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
          {label}
        </p>
        <p className="text-xl font-bold">{value}</p>
        {sub && <p className="text-muted-foreground text-xs">{sub}</p>}
      </div>
      {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}
    </ContentCard>
  );
}
