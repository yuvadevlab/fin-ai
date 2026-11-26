import React from "react";
import { cn } from "../lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Lock page container to remaining viewport height so only inner panels scroll. */
  fillViewport?: boolean;
}

export function PageContainer({
  children,
  className,
  fillViewport = false,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "finai-page-container",
        fillViewport && "finai-page-container--fill",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
