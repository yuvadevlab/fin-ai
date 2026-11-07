import React from "react";
import { cn } from "../lib/utils";

const tabs = [
  { href: "/", label: "Overview" },
  { href: "/health", label: "Financial Health" },
];

interface DashboardTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  pathname: string;
  LinkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
}

export function DashboardTabs({
  pathname,
  LinkComponent = ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  className,
  ...props
}: DashboardTabsProps) {
  return (
    <div className={cn("finai-dashboard-tabs", className)} {...props}>
      {tabs.map((t) => {
        // Handle exact matching for home, and prefix matching for sub routes
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        const Link = LinkComponent;

        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "finai-dashboard-tab",
              active ? "finai-dashboard-tab--active" : "finai-dashboard-tab--inactive",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
