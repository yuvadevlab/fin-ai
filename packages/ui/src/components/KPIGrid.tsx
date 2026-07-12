import React from "react";
import { cn } from "../lib/utils";

interface KPIGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function KPIGrid({ children, className, ...props }: KPIGridProps) {
  return (
    <section
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
      {...props}
    >
      {children}
    </section>
  );
}
