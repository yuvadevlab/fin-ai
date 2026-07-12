import React from "react";
import { cn } from "../lib/utils";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string;
  className?: string;
}

export function SectionHeader({ title, className, ...props }: SectionHeaderProps) {
  return (
    <h3
      className={cn("text-foreground mb-4 text-sm font-semibold tracking-tight", className)}
      {...props}
    >
      {title}
    </h3>
  );
}
