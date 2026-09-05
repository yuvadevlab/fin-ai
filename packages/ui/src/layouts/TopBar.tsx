import React from "react";
import { Bell, Menu, PanelLeft, PanelLeftClose, Plus, Search } from "lucide-react";
import { Button } from "../primitives/button";
import { Input } from "../primitives/input";
import { Avatar, AvatarFallback } from "../primitives/avatar";
import { cn } from "../lib/utils";

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
  onSearchChange?: (value: string) => void;
  onAddTransactionClick?: () => void;
  onNotificationsClick?: () => void;
  hasNotifications?: boolean;
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
  onSearchChange,
  onAddTransactionClick,
  onNotificationsClick,
  hasNotifications = true,
  className,
  ...props
}: TopBarProps) {
  return (
    <header
      role="banner"
      className={cn(
        "border-border/80 bg-background/80 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md md:px-8",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-muted-foreground hover:text-foreground -ml-1.5 size-9 cursor-pointer md:hidden"
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        )}
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-muted-foreground hover:text-foreground -ml-1.5 hidden size-9 cursor-pointer md:inline-flex"
            aria-label={isSidebarCollapsed ? "Expand sidebar (Cmd+B)" : "Collapse sidebar (Cmd+B)"}
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
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-foreground text-sm font-semibold tracking-tight">FinAI</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {onSearchChange && (
          <div className="relative hidden md:block" role="search">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="bg-secondary focus-visible:ring-primary/40 focus:bg-background w-72 rounded-lg border-0 pl-10 text-sm transition-colors focus-visible:ring-1"
            />
          </div>
        )}
        {actions}
        {notificationsMenu && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationsClick}
            className="hover:bg-secondary relative cursor-pointer rounded-full"
            aria-label={
              hasNotifications ? "Notifications, unread items available" : "Notifications"
            }
          >
            <Bell className="size-4" aria-hidden="true" />
            {hasNotifications && (
              <span
                className="bg-primary absolute top-2 right-2 size-1.5 rounded-full"
                aria-hidden="true"
              />
            )}
          </Button>
        )}
        {onAddTransactionClick && (
          <Button
            size="sm"
            onClick={onAddTransactionClick}
            className="hidden cursor-pointer gap-1.5 rounded-lg shadow-sm sm:inline-flex"
            aria-label="Add transaction"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Transaction
          </Button>
        )}
        {profileMenu ?? (
          <Avatar className="ring-border/60 size-8 ring-1" aria-label="User profile">
            <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}
