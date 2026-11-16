import React from "react";
import { ChartNoAxesCombined } from "lucide-react";
import { cn } from "../lib/utils";

export interface FinAILogoProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
  showName?: boolean;
  animated?: boolean;
  markClassName?: string;
}

export function FinAILogo({
  compact = false,
  showName = true,
  animated: _animated = false,
  markClassName,
  className,
  ...props
}: FinAILogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <div
        className={cn(
          "bg-primary flex shrink-0 items-center justify-center rounded-lg shadow-sm",
          compact ? "size-8" : "ring-primary/20 size-10 rounded-xl shadow-lg ring-4",
          markClassName,
        )}
        aria-hidden="true"
      >
        <ChartNoAxesCombined
          className={cn(compact ? "size-4" : "size-5", "text-primary-foreground")}
          aria-hidden="true"
        />
      </div>
      {showName && (
        <span className="text-foreground text-base font-bold tracking-tight">FinAI</span>
      )}
    </div>
  );
}
