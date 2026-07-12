import React from "react";
import { cn } from "../lib/utils";

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, topbar, children, className, ...props }: AppShellProps) {
  return (
    <div
      className={cn("bg-background text-foreground flex min-h-screen w-full", className)}
      {...props}
    >
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {topbar}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
