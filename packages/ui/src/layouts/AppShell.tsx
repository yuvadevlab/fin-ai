import React from "react";
import { cn } from "../lib/utils";

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, topbar, children, className, ...props }: AppShellProps) {
  return (
    <div className={cn("finai-app-shell", className)} {...props}>
      {sidebar}
      <div className="finai-app-shell-main">
        {topbar}
        {/* id="main-content" is the target for the skip-to-content link in layout.tsx */}
        <main
          id="main-content"
          aria-label="Main content"
          className="finai-main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
