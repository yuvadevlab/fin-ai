"use client";

import React from "react";
import { Bell, Users, Sparkles, AlertCircle, CheckCheck } from "lucide-react";
import { Button, Badge, Popover, PopoverTrigger, PopoverContent } from "@finai/ui";
import { NotificationType, InvitationAction } from "@finai/shared-types";
import { UI_COPY } from "@/lib";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notifications/api";
import { useMyInvitations, useRespondInvitation } from "@/features/workspaces/api";

export function NotificationsMenu() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: invitations = [] } = useMyInvitations();

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const respondMutation = useRespondInvitation();

  // Deduplicate: Don't show passive invitation notification when interactive invitation card is active
  const pendingInvitationIds = new Set(invitations.map((i) => i.id));
  const displayNotifications = notifications.filter((item) => {
    const inviteId = (item.data as { invitationId?: string } | null)?.invitationId;
    return !(
      item.type === NotificationType.WORKSPACE_INVITATION &&
      inviteId &&
      pendingInvitationIds.has(inviteId)
    );
  });

  // Calculate unread items strictly from displayed notifications to avoid double-counting active invitations
  const unreadCount = displayNotifications.filter((item) => !item.read).length;
  const totalCount = invitations.length + unreadCount;

  const getIcon = (type: string) => {
    if (type === NotificationType.WORKSPACE_INVITATION)
      return <Users className="text-primary size-4" />;
    if (type === NotificationType.AI_INSIGHT) return <Sparkles className="text-warning size-4" />;
    if (type === NotificationType.BUDGET_WARNING || type === NotificationType.BUDGET_EXCEEDED) {
      return <AlertCircle className="text-destructive size-4" />;
    }
    return <Bell className="text-muted-foreground size-4" />;
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

      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="border-border/80 bg-popover w-105! max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border p-0! shadow-2xl"
      >
        {/* Polished, non-collapsing header with strict 44px height and 16px horizontal alignment */}
        <div className="border-border/50 bg-muted/30 flex h-11 items-center justify-between border-b px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-foreground text-sm font-semibold tracking-tight">
              {UI_COPY.NOTIFICATIONS.TITLE}
            </span>
            {totalCount > 0 && (
              <span className="bg-primary/10 text-primary inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold">
                {totalCount}
              </span>
            )}
          </div>
          {totalCount > 0 && (
            <button
              type="button"
              disabled={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              className="text-muted-foreground hover:text-foreground inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium whitespace-nowrap transition-colors"
            >
              <CheckCheck className="size-3.5 shrink-0" />
              <span>{UI_COPY.NOTIFICATIONS.MARK_ALL_READ}</span>
            </button>
          )}
        </div>

        {/* Workspace Invitations Section (Edge-to-edge with unified 16px grid alignment) */}
        {invitations.length > 0 && (
          <div className="border-border/50 bg-primary/3 border-b">
            <div className="px-4 pt-3 pb-1">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                {UI_COPY.WORKSPACES.INVITATION_CARD_TITLE}
              </span>
            </div>
            {invitations.map((invite) => (
              <div key={invite.id} className="flex flex-col gap-2.5 px-4 pt-1.5 pb-3.5">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
                    <Users className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground truncate text-xs font-semibold">
                        {invite.workspace?.name ?? UI_COPY.WORKSPACES.SHARED_TITLE}
                      </span>
                      <Badge
                        variant="outline"
                        className="h-5 shrink-0 px-1.5 text-[10px] font-medium"
                      >
                        {invite.role}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-normal">
                      {invite.inviter?.name
                        ? `${invite.inviter.name} invited you to collaborate`
                        : UI_COPY.WORKSPACES.INVITATION_CARD_DESC}
                    </p>
                  </div>
                </div>

                {/* Inline action buttons aligned with content */}
                <div className="flex items-center gap-2 pl-11">
                  <Button
                    size="sm"
                    disabled={respondMutation.isPending}
                    onClick={() =>
                      respondMutation.mutate({
                        invitationId: invite.id,
                        action: InvitationAction.ACCEPT,
                      })
                    }
                    className="h-7 cursor-pointer px-3 text-xs font-medium shadow-xs"
                  >
                    {UI_COPY.WORKSPACES.ACCEPT}
                  </Button>
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
                    className="h-7 cursor-pointer px-3 text-xs font-medium"
                  >
                    {UI_COPY.WORKSPACES.DECLINE}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Standard notifications list with matching px-4 grid */}
        <div className="divide-border/40 max-h-75 divide-y overflow-y-auto">
          {displayNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.read) markReadMutation.mutate(item.id);
              }}
              className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${
                !item.read
                  ? "bg-primary/3 hover:bg-primary/6"
                  : "hover:bg-muted/40 opacity-75 hover:opacity-100"
              }`}
            >
              <div className="bg-secondary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg shadow-xs">
                {getIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-foreground truncate text-xs font-semibold">{item.title}</p>
                  {!item.read && <span className="bg-primary size-2 shrink-0 rounded-full" />}
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
                  {item.body}
                </p>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {displayNotifications.length === 0 && invitations.length === 0 && !isLoading && (
            <div className="px-4 py-10 text-center">
              <div className="bg-muted/50 mx-auto mb-2.5 flex size-10 items-center justify-center rounded-full">
                <Bell className="text-muted-foreground size-5" />
              </div>
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
