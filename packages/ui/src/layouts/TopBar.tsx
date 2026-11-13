import React, { useState } from "react";
import { Bell, Menu, PanelLeft, PanelLeftClose, Plus, Search, X } from "lucide-react";
import { Avatar, AvatarFallback, Button, cn, Input } from "@yuva-devlab/ui";

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

  return (
    <header role="banner" className={cn("finai-topbar", className)} {...props}>
      {isMobileSearchOpen ? (
        <div className="fn-topbar-mobile-search-bar" role="search">
          <div className="fn-topbar-mobile-search-input-wrap">
            <Input
              autoFocus
              startIcon={<Search className="text-muted-foreground size-4" aria-hidden="true" />}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="bg-secondary focus-visible:ring-primary/40 w-full rounded-lg border-0 pr-8 transition-colors focus-visible:ring-1"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="fn-topbar-search-clear-btn"
                aria-label="Clear search query"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseMobileSearch}
            className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer px-2 text-xs font-semibold"
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
                  className="text-muted-foreground hover:text-foreground -ml-1 size-8 cursor-pointer sm:size-9"
                  aria-label="Open navigation menu"
                  aria-haspopup="dialog"
                >
                  <Menu className="size-4 sm:size-5" aria-hidden="true" />
                </Button>
              </div>
            )}
            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="fn-topbar-sidebar-toggle text-muted-foreground hover:text-foreground -ml-1.5 size-9 cursor-pointer"
                aria-label={
                  isSidebarCollapsed ? "Expand sidebar (Cmd+B)" : "Collapse sidebar (Cmd+B)"
                }
                aria-expanded={!isSidebarCollapsed}
              >
                {isSidebarCollapsed ? (
                  <PanelLeft className="size-4" aria-hidden="true" />
                ) : (
                  <PanelLeftClose className="size-4" aria-hidden="true" />
                )}
              </Button>
            )}
            {leftContent ?? workspaceMenu ?? (
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5" aria-hidden="true">
                  <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75" />
                  <span className="bg-primary relative inline-flex size-2.5 rounded-full" />
                </span>
                <span className="text-foreground text-sm font-semibold tracking-tight">FinAI</span>
              </div>
            )}
          </div>

          <div className="fn-topbar-right">
            {onSearchChange && (
              <>
                <div className="fn-topbar-search-desktop" role="search">
                  <div className="fn-topbar-desktop-search-wrap">
                    <Input
                      startIcon={
                        <Search className="text-muted-foreground size-4" aria-hidden="true" />
                      }
                      placeholder={searchPlaceholder}
                      aria-label={searchPlaceholder}
                      value={query}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      className="bg-secondary focus-visible:ring-primary/40 w-64 lg:w-72 rounded-lg border-0 pr-8 transition-colors focus-visible:ring-1"
                    />
                    {query.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleQueryChange("")}
                        className="fn-topbar-search-clear-btn"
                        aria-label="Clear search query"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileSearchOpen(true)}
                  className="fn-topbar-search-mobile-btn text-muted-foreground hover:text-foreground size-8 sm:size-9 cursor-pointer rounded-full"
                  aria-label="Search"
                >
                  <Search className="size-4" aria-hidden="true" />
                </Button>
              </>
            )}
            {actions}
            {notificationsMenu ?? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNotificationsClick}
                className="hover:bg-secondary relative size-8 sm:size-9 cursor-pointer rounded-full"
                aria-label={
                  hasNotifications ? "Notifications, unread items available" : "Notifications"
                }
              >
                <Bell className="size-4" aria-hidden="true" />
                {hasNotifications && (
                  <span
                    className="bg-primary absolute top-1.5 right-1.5 size-1.5 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </Button>
            )}
            {onAddTransactionClick && (
              <Button
                size="sm"
                onClick={onAddTransactionClick}
                className="fn-topbar-add-tx-btn cursor-pointer shadow-sm"
                aria-label={addTransactionLabel}
              >
                <Plus className="size-4 shrink-0" aria-hidden="true" />
                <span className="fn-topbar-add-tx-text">{addTransactionLabel}</span>
              </Button>
            )}
            {profileMenu ?? (
              <Avatar className="ring-border/60 size-7 sm:size-8 ring-1" aria-label="User profile">
                <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
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
