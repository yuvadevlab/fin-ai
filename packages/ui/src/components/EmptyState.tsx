import React from "react";
import { cn } from "../lib/utils";
import { ContentCard } from "./ContentCard";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <ContentCard
      className={cn(
        "flex min-h-64 flex-col items-center justify-center p-12 text-center",
        className,
      )}
      {...props}
    >
      {icon && <div className="text-muted-foreground mb-4 shrink-0">{icon}</div>}
      <h3 className="text-foreground text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-[40ch] text-sm text-pretty">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </ContentCard>
  );
}
