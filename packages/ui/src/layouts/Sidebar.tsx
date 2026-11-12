import React from "react";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import {
  Button,
  cn,
  LegalFooter,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@yuva-devlab/ui";
import { SidebarItem } from "./SidebarItem";
import { SidebarAiCard } from "./SidebarAiCard";
import { IconMap, primaryNav, advancedNav, type DbMenuItem } from "./sidebarNavItems";
import { FinAILogo } from "../components/FinAILogo";

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
  version?: string;
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
  version,
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
          "finai-sidebar",
          !isMobile
            ? [
                "finai-sidebar--desktop",
                isRail ? "finai-sidebar--collapsed" : "finai-sidebar--expanded",
              ]
            : "finai-sidebar--mobile",
          className,
        )}
        {...props}
      >
        {/* Header / Brand */}
        <div className={cn("p-4", isRail ? "flex justify-center p-3" : "p-6")}>
          <FinAILogo
            compact
            showName={!isRail}
            className={cn(!isRail && "px-2")}
            markClassName="size-8"
          />
        </div>

        {/* Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className={cn("flex-1 overflow-y-auto px-2", !isRail && "px-4")}
        >
          <div className="space-y-1">
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
          </div>

          {visibleAdvancedNav.length > 0 && (
            <div className={cn("space-y-1 pt-4", !isRail && "pt-6")}>
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

        {/* Legal & Attribution Footer */}
        {!isRail && (
          <div className="border-border/40 border-t px-3 py-2">
            <LegalFooter variant="sidebar" appName="FinAI" version={version} />
          </div>
        )}

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
