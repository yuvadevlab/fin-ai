import React from "react";
import { cn, Tooltip, TooltipContent, TooltipTrigger } from "@yuva-devlab/ui";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface SidebarItemProps {
  item: NavItem;
  pathname: string;
  isRail: boolean;
  onNavigate?: () => void;
  LinkComponent: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    "aria-current"?: "page";
    "aria-label"?: string;
  }>;
}

export function SidebarItem({
  item,
  pathname,
  isRail,
  onNavigate,
  LinkComponent: Link,
}: SidebarItemProps) {
  const Icon = item.icon;
  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  const linkContent = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={isRail ? item.label : undefined}
      className={cn("fn-sidebar-link", isRail && "is-rail", active && "is-active")}
    >
      <Icon
        className={cn("fn-sidebar-link-icon", active && "is-active")}
        strokeWidth={2}
        aria-hidden="true"
      />
      {!isRail && <span>{item.label}</span>}
    </Link>
  );

  if (isRail) {
    return (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          <p className="fn-sidebar-tooltip-title">{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
}
