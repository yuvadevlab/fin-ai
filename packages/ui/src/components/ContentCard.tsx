import React from "react";
import { cn } from "../lib/utils";

interface ContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ContentCard({ children, className, ...props }: ContentCardProps) {
  return (
    <div
      className={cn(
        "bg-card ring-border/50 rounded-2xl p-6 shadow-sm ring-1 transition hover:shadow-md/5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
