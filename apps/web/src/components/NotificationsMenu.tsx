"use client";

import React from "react";
import { Bell, Users, Sparkles, AlertCircle, CheckCheck } from "lucide-react";
import { Button, Badge, Popover, PopoverTrigger, PopoverContent } from "@fin-ai/ui";
import { NotificationType, InvitationAction } from "@fin-ai/shared-types";
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

  // Calculate unread items strictly from displayed notifications
  const unreadCount = displayNotifications.filter((item) => !item.read).length;
  const totalCount = invitations.length + unreadCount;

  const getIcon = (type: string) => {
    if (type === NotificationType.WORKSPACE_INVITATION)
      return <Users className="fn-notifications-action-icon is-primary" />;
    if (type === NotificationType.AI_INSIGHT)
      return <Sparkles className="fn-notifications-action-icon is-warning" />;
    if (type === NotificationType.BUDGET_WARNING || type === NotificationType.BUDGET_EXCEEDED) {
      return <AlertCircle className="fn-notifications-action-icon is-destructive" />;
    }
    return <Bell className="fn-notifications-action-icon is-muted" />;
  };

  const a11yLabel =
    totalCount > 0 ? UI_COPY.NOTIFICATIONS.A11Y_UNREAD(totalCount) : UI_COPY.NOTIFICATIONS.TITLE;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fn-notifications-trigger"
          aria-label={a11yLabel}
        >
          <Bell className="fn-notifications-bell-icon" aria-hidden="true" />
          {totalCount > 0 && (
            <span className="fn-notifications-unread-dot" aria-hidden="true">
              {totalCount > 9 ? UI_COPY.NOTIFICATIONS.OVERFLOW_BADGE : totalCount}
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
        <div className="fn-notifications-header">
          <div className="fn-notifications-header-title-box">
            <span className="fn-notifications-header-title">{UI_COPY.NOTIFICATIONS.TITLE}</span>
            {totalCount > 0 && <span className="fn-notifications-badge">{totalCount}</span>}
          </div>
          {totalCount > 0 && (
            <button
              type="button"
              disabled={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              className="fn-notifications-mark-read"
            >
              <CheckCheck className="fn-notifications-action-icon" />
              <span>{UI_COPY.NOTIFICATIONS.MARK_ALL_READ}</span>
            </button>
          )}
        </div>

        {invitations.length > 0 && (
          <div className="fn-notifications-invitations">
            <div className="fn-notifications-invitations-title">
              {UI_COPY.WORKSPACES.INVITATION_CARD_TITLE}
            </div>
            {invitations.map((invite) => (
              <div key={invite.id} className="fn-notifications-invitation-item">
                <div className="fn-notifications-invitation-body">
                  <div className="fn-notifications-invitation-avatar">
                    <Users className="fn-notifications-bell-icon" />
                  </div>
                  <div className="fn-notifications-invitation-content">
                    <div className="fn-notifications-invitation-header">
                      <span className="fn-notifications-invitation-name">
                        {invite.workspace?.name ?? UI_COPY.WORKSPACES.SHARED_TITLE}
                      </span>
                      <Badge variant="outline" className="fn-notifications-role-badge">
                        {invite.role}
                      </Badge>
                    </div>
                    <p className="fn-notifications-invitation-desc">
                      {invite.inviter?.name
                        ? UI_COPY.WORKSPACES.INVITED_BY(invite.inviter.name)
                        : UI_COPY.WORKSPACES.INVITATION_CARD_DESC}
                    </p>
                  </div>
                </div>

                <div className="fn-notifications-invitation-actions">
                  <Button
                    size="sm"
                    disabled={respondMutation.isPending}
                    onClick={() =>
                      respondMutation.mutate({
                        invitationId: invite.id,
                        action: InvitationAction.ACCEPT,
                      })
                    }
                    className="fn-notifications-accept-btn"
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
                    className="fn-notifications-decline-btn"
                  >
                    {UI_COPY.WORKSPACES.DECLINE}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

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
              <div className="fn-notifications-item-content">
                <div className="fn-notifications-item-header">
                  <p className="fn-notifications-item-title">{item.title}</p>
                  {!item.read && <span className="fn-notifications-unread-indicator" />}
                </div>
                <p className="fn-notifications-item-body">{item.body}</p>
              </div>
            </div>
          ))}

          {displayNotifications.length === 0 && invitations.length === 0 && !isLoading && (
            <div className="fn-notifications-empty">
              <div className="fn-notifications-empty-icon">
                <Bell className="fn-notifications-empty-bell" />
              </div>
              <p className="fn-notifications-empty-title">{UI_COPY.NOTIFICATIONS.ALL_CAUGHT_UP}</p>
              <p className="fn-notifications-empty-desc">{UI_COPY.NOTIFICATIONS.EMPTY_DESC}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
