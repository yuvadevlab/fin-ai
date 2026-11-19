"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
} from "@fin-ai/ui";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers";
import { useIsClient } from "@/hooks";
import { APP_ROUTES } from "@/lib";
import { UI_COPY } from "@/lib/ui-copy";

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const isClient = useIsClient();

  // Guard with isClient so server + initial client render agree on fallbacks,
  // preventing a hydration mismatch when user is loaded from localStorage.
  const name = isClient
    ? (user?.name ?? UI_COPY.COMMON.PROFILE_MENU.FALLBACK_USER)
    : UI_COPY.COMMON.PROFILE_MENU.FALLBACK_USER;
  const email = isClient ? (user?.email ?? "") : "";
  const initials =
    (isClient && user?.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : null) ?? UI_COPY.COMMON.PROFILE_MENU.FALLBACK_INITIAL;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button id="profile-menu-trigger" className="fn-profile-trigger">
          <Avatar className="fn-profile-avatar">
            <AvatarFallback className="fn-profile-avatar-fallback">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="fn-profile-dropdown">
        <DropdownMenuLabel className="fn-profile-label">
          <div className="fn-profile-user-info">
            <p className="fn-profile-user-name">{name}</p>
            {email && <p className="fn-profile-user-email">{email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`${APP_ROUTES.SETTINGS}?section=profile`} className="fn-profile-menu-item">
            <User className="fn-profile-menu-icon" /> {UI_COPY.COMMON.PROFILE_MENU.PROFILE}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={APP_ROUTES.SETTINGS} className="fn-profile-menu-item">
            <Settings className="fn-profile-menu-icon" /> {UI_COPY.COMMON.PROFILE_MENU.SETTINGS}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="fn-profile-menu-item--destructive">
          <LogOut className="fn-profile-menu-icon" /> {UI_COPY.COMMON.PROFILE_MENU.LOG_OUT}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
