"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
} from "@finai/ui";
import { Bell, Sparkles } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

export function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-secondary relative cursor-pointer rounded-full"
        >
          <Bell className="size-4" />
          <span className="bg-primary absolute top-2 right-2 size-1.5 rounded-full" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{UI_COPY.NOTIFICATIONS.TITLE}</span>
          <span className="text-muted-foreground text-xs font-normal">
            {UI_COPY.NOTIFICATIONS.ALL_CAUGHT_UP}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
          <div className="text-foreground flex items-center gap-1.5 text-xs font-medium">
            <Sparkles className="text-primary size-3.5" />
            {UI_COPY.NOTIFICATIONS.ASSISTANT_READY}
          </div>
          <p className="text-muted-foreground text-xs">
            {UI_COPY.NOTIFICATIONS.ASSISTANT_READY_DESCRIPTION}
          </p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
