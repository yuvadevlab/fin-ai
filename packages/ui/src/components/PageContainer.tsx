import React from "react";
import { cn } from "../lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in mx-auto w-full max-w-7xl space-y-8 p-6 duration-300 md:p-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
