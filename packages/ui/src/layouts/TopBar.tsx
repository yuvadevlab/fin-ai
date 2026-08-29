import React from "react";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "../primitives/button";
import { Input } from "../primitives/input";
import { Avatar, AvatarFallback } from "../primitives/avatar";
import { cn } from "../lib/utils";

interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  leftContent?: React.ReactNode;
  workspaceMenu?: React.ReactNode;
  notificationsMenu?: React.ReactNode;
  profileMenu?: React.ReactNode;
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
      className={cn(
        "border-border/80 bg-background/80 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md md:px-8",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {leftContent ?? workspaceMenu ?? (
          <div className="flex items-center gap-2">
            <span className="bg-primary ring-primary/20 size-2.5 rounded-full ring-2" />
            <span className="text-foreground text-sm font-semibold tracking-tight">FinAI</span>
          </div>
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
