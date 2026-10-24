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
} from "@finai/ui";
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
        <button
          id="profile-menu-trigger"
          className="focus-visible:ring-ring cursor-pointer rounded-full outline-none"
        >
          <Avatar className="ring-border/60 size-8 ring-1 transition hover:opacity-80">
            <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{name}</p>
            {email && <p className="text-muted-foreground text-xs leading-none">{email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={`${APP_ROUTES.SETTINGS}?section=profile`}
            className="flex cursor-pointer items-center gap-2"
          >
            <User className="size-4" /> {UI_COPY.COMMON.PROFILE_MENU.PROFILE}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={APP_ROUTES.SETTINGS} className="flex cursor-pointer items-center gap-2">
            <Settings className="size-4" /> {UI_COPY.COMMON.PROFILE_MENU.SETTINGS}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="text-destructive focus:text-destructive flex cursor-pointer items-center gap-2"
        >
          <LogOut className="size-4" /> {UI_COPY.COMMON.PROFILE_MENU.LOG_OUT}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
