import React from "react";
import { cn } from "../lib/utils";
import { Skeleton } from "../primitives/skeleton";

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
}

export function LoadingState({ rows = 3, className, ...props }: LoadingStateProps) {
  return (
    <div className={cn("w-full space-y-4 p-2", className)} {...props}>
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
