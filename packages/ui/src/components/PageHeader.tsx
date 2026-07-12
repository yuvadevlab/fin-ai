import React from "react";
import { cn } from "../lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "border-border/10 flex flex-col items-start justify-between gap-4 border-b pb-2 sm:flex-row sm:items-end",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight text-balance">{title}</h1>
        {description && (
          <p className="text-muted-foreground max-w-[60ch] text-sm text-pretty">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
