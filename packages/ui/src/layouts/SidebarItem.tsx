import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../primitives/tooltip";
import { cn } from "../lib/utils";
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
      className={cn(
        "flex items-center rounded-lg text-sm font-semibold transition-all outline-none",
        isRail ? "mx-auto size-10 items-center justify-center p-0" : "gap-3 px-3 py-2",
        active
          ? "bg-accent text-accent-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon
        className={cn("size-4 shrink-0", active ? "text-primary" : "")}
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
          <p className="text-xs font-medium">{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
}
