"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User, LifeBuoy, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  toast,
} from "@finai/ui";

function getStoredUser(): { name?: string; email?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("finai_user");
    if (!raw) return null;
    return JSON.parse(raw) as { name?: string; email?: string };
  } catch {
    return null;
  }
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "AS";
}

export function ProfileMenu() {
  const router = useRouter();
  const user = getStoredUser();
  const name = user?.name ?? "Aditya Sharma";
  const email = user?.email ?? "aditya@sharma.family";
  const initials = getInitials(user?.name, user?.email);

  const handleSignOut = () => {
    localStorage.removeItem("finai_token");
    localStorage.removeItem("finai_user");
    localStorage.removeItem("finai_workspace_id");
    document.cookie = "finai_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "finai_workspace_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    toast.success("Signed out");
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="ring-offset-background focus-visible:ring-primary/40 cursor-pointer rounded-full outline-none focus-visible:ring-2"
        >
          <Avatar className="ring-border size-8 ring-1">
            <AvatarFallback className="bg-secondary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3 py-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-muted-foreground truncate text-xs font-normal">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer gap-2">
            <User className="size-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer gap-2">
            <Settings className="size-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => toast("Dark mode toggle coming soon")}
          className="cursor-pointer gap-2"
        >
          <Moon className="size-4" /> Appearance
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => toast("Opening help centre…")}
          className="cursor-pointer gap-2"
        >
          <LifeBuoy className="size-4" /> Help & support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleSignOut}
          className="text-destructive focus:text-destructive cursor-pointer gap-2"
        >
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
