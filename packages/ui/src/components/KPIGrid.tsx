import React from "react";
import { cn } from "../lib/utils";

interface KPIGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function KPIGrid({ children, className, ...props }: KPIGridProps) {
  return (
    <section className={cn("finai-kpi-grid", className)} {...props}>
      {children}
    </section>
  );
}
