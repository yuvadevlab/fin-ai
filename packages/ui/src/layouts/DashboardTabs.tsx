import React from "react";
import { cn } from "../lib/utils";

const tabs = [
  { href: "/", label: "My Finance" },
  { href: "/family", label: "Family" },
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
    <div className={cn("border-border/80 flex border-b", className)} {...props}>
      {tabs.map((t) => {
        // Handle exact matching for home, and prefix matching for sub routes
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        const Link = LinkComponent;

        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors outline-none",
              active
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
