import React, { useState } from "react";
import { Bell, Menu, PanelLeft, PanelLeftClose, Plus, Search, X } from "lucide-react";
import { Avatar, AvatarFallback, Button, cn, Input } from "@yuva-devlab/ui";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  leftContent?: React.ReactNode;
  workspaceMenu?: React.ReactNode;
  notificationsMenu?: React.ReactNode;
  profileMenu?: React.ReactNode;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  avatarFallback?: string;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  isMobileSearchOpen?: boolean;
  onMobileSearchOpenChange?: (open: boolean) => void;
  onAddTransactionClick?: () => void;
  onNotificationsClick?: () => void;
  hasNotifications?: boolean;
  addTransactionLabel?: string;
  cancelLabel?: string;
}

export function TopBar({
  leftContent,
  workspaceMenu,
  notificationsMenu,
  profileMenu,
  actions,
  onMenuClick,
  onToggleSidebar,
  isSidebarCollapsed = false,
  avatarFallback = "AS",
  searchPlaceholder = "Search transactions, categories…",
  searchQuery: controlledQuery,
  onSearchChange,
  isMobileSearchOpen: controlledMobileSearchOpen,
  onMobileSearchOpenChange,
  onAddTransactionClick,
  onNotificationsClick,
  hasNotifications = true,
  addTransactionLabel = "Add Transaction",
  cancelLabel = "Cancel",
  className,
  ...props
}: TopBarProps) {
  const [internalQuery, setInternalQuery] = useState("");
  const [internalMobileSearchOpen, setInternalMobileSearchOpen] = useState(false);

  const query = controlledQuery !== undefined ? controlledQuery : internalQuery;
  const isMobileSearchOpen =
    controlledMobileSearchOpen !== undefined
      ? controlledMobileSearchOpen
      : internalMobileSearchOpen;

  const setMobileSearchOpen = (open: boolean) => {
    if (onMobileSearchOpenChange) {
      onMobileSearchOpenChange(open);
    } else {
      setInternalMobileSearchOpen(open);
    }
  };

  const handleQueryChange = (val: string) => {
    if (controlledQuery === undefined) setInternalQuery(val);
    onSearchChange?.(val);
  };

  const handleCloseMobileSearch = () => {
    setMobileSearchOpen(false);
    handleQueryChange("");
  };

  const copy = UI_COPY_CONSTANTS.TOPBAR;

  return (
    <header role="banner" className={cn("finai-topbar", className)} {...props}>
      {isMobileSearchOpen ? (
        <div className="fn-topbar-mobile-search-bar" role="search">
          <div className="fn-topbar-mobile-search-input-wrap">
            <Input
              autoFocus
              startIcon={<Search className="fn-topbar-search-icon" aria-hidden="true" />}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="fn-topbar-search-input"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="fn-topbar-search-clear-btn"
                aria-label={copy.CLEAR_SEARCH_ARIA}
              >
                <X className="fn-icon-xs" />
              </button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseMobileSearch}
            className="fn-topbar-cancel-btn"
          >
            {cancelLabel}
          </Button>
        </div>
      ) : (
        <>
          <div className="fn-topbar-left">
            {onMenuClick && (
              <div className="fn-topbar-menu-toggle">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMenuClick}
                  className="fn-topbar-menu-btn"
                  aria-label={copy.OPEN_MENU_ARIA}
                  aria-haspopup="dialog"
                >
                  <Menu className="fn-icon-md" aria-hidden="true" />
                </Button>
              </div>
            )}
            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="fn-topbar-sidebar-toggle"
                aria-label={
                  isSidebarCollapsed ? copy.EXPAND_SIDEBAR_ARIA : copy.COLLAPSE_SIDEBAR_ARIA
                }
                aria-expanded={!isSidebarCollapsed}
              >
                {isSidebarCollapsed ? (
                  <PanelLeft className="fn-icon-md" aria-hidden="true" />
                ) : (
                  <PanelLeftClose className="fn-icon-md" aria-hidden="true" />
                )}
              </Button>
            )}
            {leftContent ?? workspaceMenu ?? (
              <div className="fn-topbar-brand-wrap">
                <span className="fn-topbar-ping-wrap" aria-hidden="true">
                  <span className="fn-topbar-ping-dot-pulse" />
                  <span className="fn-topbar-ping-dot" />
                </span>
                <span className="fn-topbar-brand-text">{UI_COPY_CONSTANTS.BRAND.NAME}</span>
              </div>
            )}
          </div>

          <div className="fn-topbar-right">
            {onSearchChange && (
              <>
                <div className="fn-topbar-search-desktop" role="search">
                  <div className="fn-topbar-desktop-search-wrap">
                    <Input
                      startIcon={<Search className="fn-topbar-search-icon" aria-hidden="true" />}
                      placeholder={searchPlaceholder}
                      aria-label={searchPlaceholder}
                      value={query}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      className="fn-topbar-desktop-search-input"
                    />
                    {query.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleQueryChange("")}
                        className="fn-topbar-search-clear-btn"
                        aria-label={copy.CLEAR_SEARCH_ARIA}
                      >
                        <X className="fn-icon-xs" />
                      </button>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileSearchOpen(true)}
                  className="fn-topbar-search-mobile-btn"
                  aria-label={copy.SEARCH_ARIA}
                >
                  <Search className="fn-icon-md" aria-hidden="true" />
                </Button>
              </>
            )}
            {actions}
            {notificationsMenu ?? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNotificationsClick}
                className="fn-topbar-notif-btn"
                aria-label={
                  hasNotifications ? copy.NOTIFICATIONS_UNREAD_ARIA : copy.NOTIFICATIONS_ARIA
                }
              >
                <Bell className="fn-icon-md" aria-hidden="true" />
                {hasNotifications && <span className="fn-topbar-notif-badge" aria-hidden="true" />}
              </Button>
            )}
            {onAddTransactionClick && (
              <Button
                size="sm"
                onClick={onAddTransactionClick}
                className="fn-topbar-add-tx-btn"
                aria-label={addTransactionLabel}
              >
                <Plus className="fn-icon-md" aria-hidden="true" />
                <span className="fn-topbar-add-tx-text">{addTransactionLabel}</span>
              </Button>
            )}
            {profileMenu ?? (
              <Avatar className="fn-topbar-avatar" aria-label={copy.USER_PROFILE_ARIA}>
                <AvatarFallback className="fn-topbar-avatar-fallback">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </>
      )}
    </header>
  );
}
