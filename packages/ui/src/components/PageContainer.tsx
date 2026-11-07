import React from "react";
import { cn } from "../lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div className={cn("finai-page-container space-y-6 xl:space-y-8", className)} {...props}>
      {children}
    </div>
  );
}
