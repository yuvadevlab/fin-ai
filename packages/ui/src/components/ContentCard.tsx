import React from "react";
import { cn } from "../lib/utils";

interface ContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ContentCard({ children, className, ...props }: ContentCardProps) {
  return (
    <div className={cn("finai-card", className)} {...props}>
      {children}
    </div>
  );
}
