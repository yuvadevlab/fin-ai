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
import type { NavItem } from "./SidebarItem";

export const IconMap: Record<string, LucideIcon> = {
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

export const primaryNav: NavItem[] = [
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

export const advancedNav: NavItem[] = [
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
