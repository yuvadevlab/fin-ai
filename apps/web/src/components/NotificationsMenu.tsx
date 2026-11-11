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
        className="fn-notifications-popover"
      >
        {/* Polished, non-collapsing header */}
        <div className="fn-notifications-header">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-foreground text-sm font-semibold tracking-tight">
              {UI_COPY.NOTIFICATIONS.TITLE}
            </span>
            {totalCount > 0 && <span className="fn-notifications-badge">{totalCount}</span>}
          </div>
          {totalCount > 0 && (
            <button
              type="button"
              disabled={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              className="fn-notifications-mark-read"
            >
              <CheckCheck className="size-3.5 shrink-0" />
              <span>{UI_COPY.NOTIFICATIONS.MARK_ALL_READ}</span>
            </button>
          )}
        </div>

        {/* Workspace Invitations Section */}
        {invitations.length > 0 && (
          <div className="fn-notifications-invitations">
            <div className="fn-notifications-invitations-title">
              {UI_COPY.WORKSPACES.INVITATION_CARD_TITLE}
            </div>
            {invitations.map((invite) => (
              <div key={invite.id} className="fn-notifications-invitation-item">
                <div className="flex items-start gap-3">
                  <div className="fn-notifications-invitation-avatar">
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
        <div className="fn-notifications-list">
          {displayNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.read) markReadMutation.mutate(item.id);
              }}
              className={`fn-notifications-item ${!item.read ? "is-unread" : ""}`}
            >
              <div className="fn-notifications-item-icon">{getIcon(item.type)}</div>
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
            <div className="fn-notifications-empty">
              <div className="fn-notifications-empty-icon">
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
