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
    <ContentCard className={cn("finai-ministat", className)} {...props}>
      <div className="finai-ministat-body">
        <p className="finai-ministat-label">{label}</p>
        <p className="finai-ministat-value">{value}</p>
        {sub && <p className="finai-ministat-sub">{sub}</p>}
      </div>
      {icon && <div className="finai-ministat-icon">{icon}</div>}
    </ContentCard>
  );
}
