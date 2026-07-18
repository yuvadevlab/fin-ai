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
  Users,
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
  Users,
  HeartPulse,
};

const routeFeatures = {
  "/transactions": process.env.NEXT_PUBLIC_FEATURE_TRANSACTIONS === "true",
  "/accounts": process.env.NEXT_PUBLIC_FEATURE_ACCOUNTS === "true",
  "/budgets": process.env.NEXT_PUBLIC_FEATURE_BUDGETS === "true",
  "/goals": process.env.NEXT_PUBLIC_FEATURE_GOALS === "true",
  "/categories": process.env.NEXT_PUBLIC_FEATURE_CATEGORIES === "true",
  "/investments": process.env.NEXT_PUBLIC_FEATURE_INVESTMENTS === "true",
  "/reports": process.env.NEXT_PUBLIC_FEATURE_REPORTS === "true",
  "/family": process.env.NEXT_PUBLIC_FEATURE_FAMILY === "true",
  "/health": process.env.NEXT_PUBLIC_FEATURE_HEALTH === "true",
  "/ai-advisor": process.env.NEXT_PUBLIC_FEATURE_AI_ADVISOR === "true",
  "/settings": process.env.NEXT_PUBLIC_FEATURE_SETTINGS === "true",
} as const;

function isRouteEnabled(href: string) {
  if (href === "/") return true;

  return routeFeatures[href as keyof typeof routeFeatures] ?? true;
}

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const primaryNav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/investments", label: "Investments", icon: TrendingUp },
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
  planName = "Family Plan",
  planDetails = "3 members · 92% synced",
  planSyncPercentage = 92,
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

  // Compute navigation lists dynamically if menuItems are loaded, otherwise fallback
  const visiblePrimaryNav = React.useMemo(() => {
    if (menuItems && menuItems.length > 0) {
      return menuItems
        .filter((item) => item.group === "OVERVIEW" && item.isActive)
        .map((item) => ({
          href: item.href,
          label: item.label,
          icon: IconMap[item.icon] ?? Settings,
        }));
    }
    return primaryNav.filter((item) => isRouteEnabled(item.href));
  }, [menuItems]);

  const visibleAdvancedNav = React.useMemo(() => {
    if (menuItems && menuItems.length > 0) {
      return menuItems
        .filter((item) => item.group === "INTELLIGENCE" && item.isActive)
        .map((item) => ({
          href: item.href,
          label: item.label,
          icon: IconMap[item.icon] ?? Settings,
        }));
    }
    return advancedNav.filter((item) => isRouteEnabled(item.href));
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
            <div className="bg-primary-foreground/90 size-2.5 animate-pulse rounded-full" />
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
