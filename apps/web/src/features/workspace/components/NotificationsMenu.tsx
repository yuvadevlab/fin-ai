"use client";

import { Bell, AlertTriangle, TrendingUp, Sparkles, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Button,
  cn,
  toast,
} from "@finai/ui";

const items = [
  {
    icon: AlertTriangle,
    title: "Entertainment budget almost hit",
    body: "You're at 92% of your ₹6,000 cap with 5 days to go.",
    time: "12m ago",
    tone: "warn" as const,
  },
  {
    icon: TrendingUp,
    title: "Salary credited",
    body: "₹1,25,000 received from Acme Corp in HDFC Salary.",
    time: "2h ago",
    tone: "good" as const,
  },
  {
    icon: Sparkles,
    title: "New AI insight",
    body: "Your dining spend is 18% higher than usual this month.",
    time: "Today",
    tone: "info" as const,
  },
  {
    icon: Wallet,
    title: "Rent auto-paid",
    body: "₹32,000 paid to Landlord from Joint Account.",
    time: "Yesterday",
    tone: "info" as const,
  },
];

export function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer rounded-full">
          <Bell className="size-4" />
          <span className="bg-primary absolute top-2 right-2 size-1.5 rounded-full" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button
            type="button"
            className="text-primary cursor-pointer text-xs hover:underline"
            onClick={() => toast.success("All notifications marked as read")}
          >
            Mark all read
          </button>
        </div>
        <ul className="max-h-96 overflow-y-auto">
          {items.map((n) => {
            const Icon = n.icon;
            return (
              <li
                key={n.title}
                className="border-border/60 hover:bg-secondary/40 flex gap-3 border-b px-4 py-3 last:border-0"
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    n.tone === "warn" && "bg-amber-500/10 text-amber-600",
                    n.tone === "good" && "bg-primary/10 text-primary",
                    n.tone === "info" && "bg-secondary text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-tight font-medium">{n.title}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">{n.body}</p>
                  <p className="text-muted-foreground/70 mt-1 text-[10px] tracking-widest uppercase">
                    {n.time}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-border border-t px-4 py-2 text-center">
          <button
            type="button"
            className="text-primary cursor-pointer text-xs font-medium hover:underline"
            onClick={() => toast("Opening all notifications…")}
          >
            View all notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
