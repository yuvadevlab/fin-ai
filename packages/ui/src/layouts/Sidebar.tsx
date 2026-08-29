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
  Tag,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/utils";

const IconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Target,
  TrendingUp,
  FileBarChart,
  Sparkles,
  Settings,
  Tag,
  HeartPulse,
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const primaryNav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/health", label: "Financial Health", icon: HeartPulse },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

const advancedNav: NavItem[] = [
  { href: "/ai-advisor", label: "AI Advisor", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export interface DbMenuItem {
  label: string;
  href: string;
  icon: string;
  group: string;
  isActive: boolean;
}

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
  menuItems?: DbMenuItem[];
}

export function Sidebar({
  pathname,
  LinkComponent = ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  planName = "Personal Vault",
  planDetails = "Personal Edition · 100% Synced",
  planSyncPercentage = 100,
  menuItems,
  className,
  ...props
}: SidebarProps) {
  const Link = LinkComponent;

  const renderLink = (item: NavItem) => {
    const Icon = item.icon;
    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

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

  // Compute navigation lists dynamically if menuItems are loaded, otherwise use built-in nav
  const visiblePrimaryNav = React.useMemo(() => {
    if (menuItems && menuItems.length > 0) {
      const filtered = menuItems
        .filter((item) => item.group.toUpperCase() === "OVERVIEW" && item.isActive)
        .map((item) => ({
          href: item.href,
          label: item.label,
          icon: IconMap[item.icon] ?? Settings,
        }));
      if (filtered.length > 0) return filtered;
    }
    return primaryNav;
  }, [menuItems]);

  const visibleAdvancedNav = React.useMemo(() => {
    if (menuItems && menuItems.length > 0) {
      const filtered = menuItems
        .filter((item) => item.group.toUpperCase() === "INTELLIGENCE" && item.isActive)
        .map((item) => ({
          href: item.href,
          label: item.label,
          icon: IconMap[item.icon] ?? Settings,
        }));
      if (filtered.length > 0) return filtered;
    }
    return advancedNav;
  }, [menuItems]);

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
            <Sparkles className={"size-4 animate-pulse"} />
          </div>
          <span className="text-foreground text-base font-bold tracking-tight">FinAI</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        <div className="text-muted-foreground/70 mb-2 px-3 text-[10px] font-bold tracking-widest uppercase">
          Overview
        </div>

        {visiblePrimaryNav.map(renderLink)}

        {visibleAdvancedNav.length > 0 && (
          <div className="pt-6">
            <div className="text-muted-foreground/70 mb-2 px-3 text-[10px] font-bold tracking-widest uppercase">
              Intelligence
            </div>

            {visibleAdvancedNav.map(renderLink)}
          </div>
        )}
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
