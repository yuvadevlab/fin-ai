import React from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Target,
  TrendingUp,
  FileBarChart,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const primaryNav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

const advancedNav: NavItem[] = [
  { href: "/ai-advisor", label: "AI Advisor", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  pathname: string;
  LinkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
  planName?: string;
  planDetails?: string;
  planSyncPercentage?: number;
}

export function Sidebar({
  pathname,
  LinkComponent = ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  planName = "Family Plan",
  planDetails = "3 members · 92% synced",
  planSyncPercentage = 92,
  className,
  ...props
}: SidebarProps) {
  const renderLink = (item: NavItem) => {
    const Icon = item.icon;
    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    const Link = LinkComponent;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors outline-none",
          active
            ? "bg-accent text-accent-foreground shadow-sm"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" strokeWidth={2} />
        {item.label}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "border-border/80 bg-sidebar sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r md:flex",
        className,
      )}
      {...props}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 px-2">
          <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-md shadow-sm">
            <div className="bg-primary-foreground/90 size-2.5 animate-pulse rounded-full" />
          </div>
          <span className="text-foreground text-base font-bold tracking-tight">FinAI</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        <div className="text-muted-foreground/70 mb-2 px-3 text-[10px] font-bold tracking-widest uppercase">
          Overview
        </div>
        {primaryNav.map(renderLink)}
        <div className="pt-6">
          <div className="text-muted-foreground/70 mb-2 px-3 text-[10px] font-bold tracking-widest uppercase">
            Intelligence
          </div>
          {advancedNav.map(renderLink)}
        </div>
      </nav>

      <div className="p-4">
        <div className="border-border/60 bg-secondary/40 rounded-xl border p-4">
          <p className="text-foreground text-xs font-bold">{planName}</p>
          <p className="text-muted-foreground mt-1 text-[11px]">{planDetails}</p>
          <div className="bg-border/60 mt-3 h-1 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${planSyncPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
