import React from "react";
import { cn } from "../lib/utils";

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "border-border/10 flex flex-col items-start justify-between gap-3 border-b pb-3 sm:flex-row sm:items-end sm:gap-4",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-foreground text-xl font-bold tracking-tight text-balance sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground max-w-[60ch] text-xs text-pretty sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
