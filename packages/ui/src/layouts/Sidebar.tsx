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
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

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

  const copy = UI_COPY_CONSTANTS.SIDEBAR;

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        aria-label={copy.NAV_ARIA}
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
        <div className={cn("fn-sidebar-header", isRail && "fn-sidebar-header--collapsed")}>
          <FinAILogo compact showName={!isRail} />
        </div>

        {/* Navigation Links */}
        <nav
          aria-label={copy.MAIN_NAV_ARIA}
          className={cn("fn-sidebar-nav", isRail && "fn-sidebar-nav--collapsed")}
        >
          <div className="fn-sidebar-nav-group">
            {!isRail ? (
              <div className="fn-sidebar-nav-heading" id="nav-overview-heading">
                {copy.OVERVIEW_HEADING}
              </div>
            ) : (
              <Separator className="fn-sidebar-separator" />
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
            <div
              className={cn(
                "fn-sidebar-nav-group fn-sidebar-nav-group--advanced",
                !isRail && "is-expanded",
              )}
            >
              {!isRail ? (
                <div className="fn-sidebar-nav-heading" id="nav-intelligence-heading">
                  {copy.INTELLIGENCE_HEADING}
                </div>
              ) : (
                <Separator className="fn-sidebar-separator" />
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
          <div className="fn-sidebar-legal-wrap">
            <LegalFooter
              variant="sidebar"
              appName={UI_COPY_CONSTANTS.BRAND.NAME}
              version={version}
            />
          </div>
        )}

        {/* Desktop / Tablet Collapse Toggle Footer */}
        {!isMobile && onToggleCollapse && (
          <div className="fn-sidebar-collapse-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className={cn(
                    "fn-sidebar-collapse-btn",
                    isRail && "fn-sidebar-collapse-btn--rail",
                  )}
                  aria-label={isRail ? copy.EXPAND_ARIA : copy.COLLAPSE_ARIA}
                  aria-expanded={!isRail}
                >
                  {isRail ? (
                    <PanelLeft className="fn-icon-md" aria-hidden="true" />
                  ) : (
                    <>
                      <PanelLeftClose className="fn-icon-md" aria-hidden="true" />
                      <span>{copy.COLLAPSE_TEXT}</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                <p className="fn-sidebar-collapse-text">
                  {isRail ? copy.EXPAND_ARIA : copy.COLLAPSE_ARIA}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
