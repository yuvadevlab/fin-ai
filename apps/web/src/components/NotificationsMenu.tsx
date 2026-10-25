"use client";

import React from "react";
import { Bell, Check, Users, Sparkles, AlertCircle, CheckCheck } from "lucide-react";
import { Button, Badge, Popover, PopoverTrigger, PopoverContent } from "@finai/ui";
import { NotificationType, InvitationAction } from "@finai/shared-types";
import { UI_COPY } from "@/lib";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notifications/api";
import { useMyInvitations, useRespondInvitation } from "@/features/workspaces/api";

export function NotificationsMenu() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadData } = useUnreadNotificationsCount();
  const { data: invitations = [] } = useMyInvitations();

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const respondMutation = useRespondInvitation();

  const unreadCount = unreadData?.count ?? 0;
  const totalCount = unreadCount + invitations.length;

  const getIcon = (type: string) => {
    switch (type) {
      case NotificationType.WORKSPACE_INVITATION:
        return <Users className="text-primary size-4" />;
      case NotificationType.AI_INSIGHT:
        return <Sparkles className="text-warning size-4" />;
      case NotificationType.BUDGET_WARNING:
      case NotificationType.BUDGET_EXCEEDED:
        return <AlertCircle className="text-destructive size-4" />;
      default:
        return <Bell className="text-muted-foreground size-4" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-secondary relative cursor-pointer rounded-full"
          aria-label={
            totalCount > 0 ? `Notifications, ${totalCount} unread items available` : "Notifications"
          }
        >
          <Bell className="size-4" aria-hidden="true" />
          {totalCount > 0 && (
            <span
              className="bg-primary absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-xs"
              aria-hidden="true"
            >
              {totalCount > 9 ? "9+" : totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0 shadow-xl sm:w-96">
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{UI_COPY.NOTIFICATIONS.TITLE}</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {UI_COPY.NOTIFICATIONS.UNREAD_COUNT(unreadCount)}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs"
            >
              <CheckCheck className="size-3.5" />
              {UI_COPY.NOTIFICATIONS.MARK_ALL_READ}
            </Button>
          )}
        </div>

        <div className="max-h-95 divide-y overflow-y-auto">
          {/* Workspace Invitations inline in notifications */}
          {invitations.map((invite) => (
            <div
              key={invite.id}
              className="bg-primary/5 hover:bg-primary/10 flex flex-col gap-2 p-3 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <div className="bg-primary/15 text-primary mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg">
                  <Users className="size-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-xs font-semibold">
                    {UI_COPY.NOTIFICATIONS.INVITATION_TITLE}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {invite.inviter?.name
                      ? `${invite.inviter.name} invited you to "${invite.workspace?.name}"`
                      : `You were invited to "${invite.workspace?.name}"`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={respondMutation.isPending}
                  onClick={() =>
                    respondMutation.mutate({
                      invitationId: invite.id,
                      action: InvitationAction.REJECT,
                    })
                  }
                  className="h-7 px-2.5 text-xs"
                >
                  {UI_COPY.WORKSPACES.DECLINE}
                </Button>
                <Button
                  size="sm"
                  disabled={respondMutation.isPending}
                  onClick={() =>
                    respondMutation.mutate({
                      invitationId: invite.id,
                      action: InvitationAction.ACCEPT,
                    })
                  }
                  className="h-7 px-2.5 text-xs"
                >
                  <Check className="mr-1 size-3" />
                  {UI_COPY.WORKSPACES.ACCEPT}
                </Button>
              </div>
            </div>
          ))}

          {/* Standard notification list */}
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.read) markReadMutation.mutate(item.id);
              }}
              className={`flex items-start gap-3 p-3 transition-colors ${
                !item.read
                  ? "bg-secondary/40 hover:bg-secondary/60 cursor-pointer font-medium"
                  : "hover:bg-secondary/20 opacity-80"
              }`}
            >
              <div className="bg-secondary mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg">
                {getIcon(item.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-foreground text-xs font-semibold">{item.title}</p>
                  {!item.read && <span className="bg-primary size-1.5 shrink-0 rounded-full" />}
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">{item.body}</p>
              </div>
            </div>
          ))}

          {notifications.length === 0 && invitations.length === 0 && !isLoading && (
            <div className="py-8 text-center">
              <Bell className="text-muted-foreground/40 mx-auto mb-2 size-7" />
              <p className="text-foreground text-xs font-medium">
                {UI_COPY.NOTIFICATIONS.ALL_CAUGHT_UP}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {UI_COPY.NOTIFICATIONS.EMPTY_DESC}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
