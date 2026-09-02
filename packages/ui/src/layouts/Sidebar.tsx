import React from "react";
import { Sparkles, PanelLeftClose, PanelLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../primitives/tooltip";
import { Button } from "../primitives/button";
import { Separator } from "../primitives/separator";
import { cn } from "../lib/utils";
import { SidebarItem } from "./SidebarItem";
import { SidebarAiCard } from "./SidebarAiCard";
import { IconMap, primaryNav, advancedNav, type DbMenuItem } from "./sidebarNavItems";

export { type DbMenuItem };

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  pathname: string;
  LinkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    "aria-current"?: "page";
    "aria-label"?: string;
  }>;
  menuItems?: DbMenuItem[];
  onNavigate?: () => void;
  isMobile?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DefaultLink = ({
  href,
  children,
  className,
  onClick,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <a href={href} className={className} onClick={onClick} {...rest}>
    {children}
  </a>
);

export function Sidebar({
  pathname,
  LinkComponent: Link = DefaultLink,
  menuItems,
  onNavigate,
  isMobile = false,
  collapsed = false,
  onToggleCollapse,
  className,
  ...props
}: SidebarProps) {
  const isRail = !isMobile && collapsed;

  // Compute navigation lists dynamically if menuItems are loaded, otherwise use built-in nav
  const visiblePrimaryNav = React.useMemo(() => {
    if (menuItems && menuItems.length > 0) {
      const filtered = menuItems
        .filter((item) => item.group.toUpperCase() === "OVERVIEW" && item.isActive)
        .map((item) => ({
          href: item.href,
          label: item.label,
          icon: IconMap[item.icon] ?? primaryNav[0].icon,
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
          icon: IconMap[item.icon] ?? advancedNav[0].icon,
        }));
      if (filtered.length > 0) return filtered;
    }
    return advancedNav;
  }, [menuItems]);

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        aria-label="Sidebar navigation"
        className={cn(
          "border-border/80 bg-sidebar flex h-screen shrink-0 flex-col transition-[width] duration-200 ease-in-out",
          !isMobile
            ? isRail
              ? "sticky top-0 hidden w-18 border-r md:flex"
              : "sticky top-0 hidden w-64 border-r md:flex"
            : "w-full border-none",
          className,
        )}
        {...props}
      >
        {/* Header / Brand */}
        <div className={cn("p-4", isRail ? "flex justify-center p-3" : "p-6")}>
          <div className={cn("flex items-center gap-2", isRail ? "justify-center px-0" : "px-2")}>
            <div
              className="bg-primary flex size-8 items-center justify-center rounded-lg shadow-sm"
              aria-hidden="true"
            >
              <Sparkles className="size-4 text-white" />
            </div>
            {!isRail && (
              <span className="text-foreground text-base font-bold tracking-tight">FinAI</span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className={cn("flex-1 space-y-1 overflow-y-auto px-2", !isRail && "px-4")}
        >
          {!isRail ? (
            <div
              className="text-muted-foreground/70 mb-2 px-3 text-[10px] font-bold tracking-widest uppercase"
              id="nav-overview-heading"
            >
              Overview
            </div>
          ) : (
            <Separator className="my-2 opacity-50" />
          )}

          {visiblePrimaryNav.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              pathname={pathname}
              isRail={isRail}
              onNavigate={onNavigate}
              LinkComponent={Link}
            />
          ))}

          {visibleAdvancedNav.length > 0 && (
            <div className={cn("pt-4", !isRail && "pt-6")}>
              {!isRail ? (
                <div
                  className="text-muted-foreground/70 mb-2 px-3 text-[10px] font-bold tracking-widest uppercase"
                  id="nav-intelligence-heading"
                >
                  Intelligence
                </div>
              ) : (
                <Separator className="my-2 opacity-50" />
              )}

              {visibleAdvancedNav.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  isRail={isRail}
                  onNavigate={onNavigate}
                  LinkComponent={Link}
                />
              ))}
            </div>
          )}
        </nav>

        {/* Bottom AI Status Card */}
        <SidebarAiCard isRail={isRail} onNavigate={onNavigate} LinkComponent={Link} />

        {/* Desktop / Tablet Collapse Toggle Footer */}
        {!isMobile && onToggleCollapse && (
          <div className="border-border/60 border-t p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className={cn(
                    "text-muted-foreground hover:text-foreground w-full cursor-pointer rounded-lg text-xs font-medium",
                    isRail ? "size-10 justify-center p-0" : "justify-start gap-2.5 px-3 py-2",
                  )}
                  aria-label={isRail ? "Expand sidebar (Cmd+B)" : "Collapse sidebar (Cmd+B)"}
                  aria-expanded={!isRail}
                >
                  {isRail ? (
                    <PanelLeft className="size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <>
                      <PanelLeftClose className="size-4 shrink-0" aria-hidden="true" />
                      <span>Collapse Sidebar</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                <p className="text-xs">
                  {isRail ? "Expand sidebar (Cmd+B)" : "Collapse sidebar (Cmd+B)"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
