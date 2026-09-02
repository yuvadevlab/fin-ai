import React from "react";
import { cn } from "../lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in mx-auto w-full space-y-6 duration-300 xl:space-y-8",
        className,
      )}
      style={{
        paddingInline: "var(--page-padding-x)",
        paddingBlock: "var(--page-padding-y)",
        maxWidth: "var(--page-max-width)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
