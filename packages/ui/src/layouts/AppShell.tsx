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
      className={cn("bg-background text-foreground flex h-dvh w-full overflow-hidden", className)}
      {...props}
    >
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {topbar}
        {/* id="main-content" is the target for the skip-to-content link in layout.tsx */}
        <main
          id="main-content"
          aria-label="Main content"
          className="min-h-0 flex-1 overflow-y-auto scroll-smooth"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
