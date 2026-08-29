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
  ArrowRight,
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
  menuItems?: DbMenuItem[];
}

const DefaultLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <a href={href} className={className}>
    {children}
  </a>
);

export function Sidebar({
  pathname,
  LinkComponent: Link = DefaultLink,
  menuItems,
  className,
  ...props
}: SidebarProps) {
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
            <Sparkles className="size-4 text-white" />
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

      {/* AI Advisor Quick Status Widget */}
      <div className="p-4">
        <Link
          href="/ai-advisor"
          className="group border-border/70 hover:border-primary/40 bg-secondary/30 hover:bg-secondary/60 relative block overflow-hidden rounded-2xl border p-3.5 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-foreground text-xs font-semibold">AI Advisor</span>
            </div>
            <span className="bg-primary/10 text-primary rounded-md px-1.5 py-0.5 text-[10px] font-medium">
              Ready
            </span>
          </div>
          <p className="text-muted-foreground mt-1.5 text-[11px] leading-snug">
            Get personalized insights & wealth optimization.
          </p>
          <div className="text-primary mt-2.5 flex items-center gap-1 text-xs font-medium group-hover:underline">
            <span>Ask question</span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>
    </aside>
  );
}
