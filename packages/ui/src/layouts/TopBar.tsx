import React from "react";
import { Bell, ChevronDown, Plus, Search } from "lucide-react";
import { Button } from "../primitives/button";
import { Input } from "../primitives/input";
import { Avatar, AvatarFallback } from "../primitives/avatar";
import { cn } from "../lib/utils";

interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  workspaceMenu?: React.ReactNode;
  notificationsMenu?: React.ReactNode;
  profileMenu?: React.ReactNode;
  workspaceName?: string;
  avatarFallback?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onAddTransactionClick?: () => void;
  onNotificationsClick?: () => void;
  onWorkspaceClick?: () => void;
  hasNotifications?: boolean;
}

export function TopBar({
  workspaceMenu,
  notificationsMenu,
  profileMenu,
  workspaceName = "Sharma Family",
  avatarFallback = "AS",
  searchPlaceholder = "Search transactions, insights…",
  onSearchChange,
  onAddTransactionClick,
  onNotificationsClick,
  onWorkspaceClick,
  hasNotifications = true,
  className,
  ...props
}: TopBarProps) {
  return (
    <header
      className={cn(
        "border-border/80 bg-background/80 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md md:px-8",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {workspaceMenu ?? (
          <button
            onClick={onWorkspaceClick}
            className="bg-secondary ring-border/80 hover:bg-secondary/80 focus-visible:ring-ring flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 ring-1 transition outline-none"
          >
            <span className="bg-primary size-2 rounded-full" />
            <span className="text-foreground text-xs font-semibold">{workspaceName}</span>
            <ChevronDown className="text-muted-foreground size-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {onSearchChange && (
          <div className="relative hidden md:block">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="bg-secondary focus-visible:ring-primary/40 focus:bg-background w-72 rounded-lg border-0 pl-10 text-sm transition-colors focus-visible:ring-1"
            />
          </div>
        )}
        {notificationsMenu && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationsClick}
            className="hover:bg-secondary relative cursor-pointer rounded-full"
          >
            <Bell className="size-4" />
            {hasNotifications && (
              <span className="bg-primary absolute top-2 right-2 size-1.5 rounded-full" />
            )}
          </Button>
        )}
        {onAddTransactionClick && (
          <Button
            size="sm"
            onClick={onAddTransactionClick}
            className="hidden cursor-pointer gap-1.5 rounded-lg shadow-sm sm:inline-flex"
          >
            <Plus className="size-4" />
            Add Transaction
          </Button>
        )}
        {profileMenu ?? (
          <Avatar className="ring-border/60 size-8 ring-1">
            <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}
