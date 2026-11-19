"use client";

import React from "react";
import { Users, Check, X, Mail } from "lucide-react";
import { Button, Badge, cn } from "@fin-ai/ui";
import { UI_COPY } from "@/lib";
import { useMyInvitations, useRespondInvitation } from "../api";
import { WorkspaceRole, InvitationAction } from "@fin-ai/shared-types";

interface WorkspaceInvitationCardProps {
  className?: string;
  showEmptyState?: boolean;
}

/** Displays pending workspace invitations with accept / decline actions. */
export function WorkspaceInvitationCard({
  className,
  showEmptyState = false,
}: WorkspaceInvitationCardProps) {
  const { data: invitations = [], isLoading } = useMyInvitations();
  const respondMutation = useRespondInvitation();

  if (isLoading) {
    return null;
  }

  if (invitations.length === 0) {
    if (!showEmptyState) return null;
    return (
      <div className={cn("fn-workspace-invitations-empty", className)}>
        <div className="fn-workspace-invitations-empty-icon">
          <Mail className="fn-notifications-action-icon" />
        </div>
        <p className="fn-workspace-invitations-empty-text">
          {UI_COPY.WORKSPACES.NO_PENDING_INVITATIONS}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("fn-workspace-invitations-list", className)}>
      {invitations.map((invite) => {
        const roleLabel =
          invite.role === WorkspaceRole.ADMIN
            ? UI_COPY.WORKSPACES.ROLE_ADMIN
            : UI_COPY.WORKSPACES.ROLE_MEMBER;

        const isPending = respondMutation.isPending;

        return (
          <div key={invite.id} className="fn-workspace-invitation-card">
            <div className="fn-workspace-invitation-body">
              <div className="fn-workspace-invitation-icon">
                <Users className="fn-notifications-action-icon" />
              </div>
              <div className="fn-workspace-invitation-content">
                <div className="fn-workspace-invitation-header">
                  <p className="fn-workspace-invitation-title">
                    {invite.workspace?.name ?? UI_COPY.WORKSPACES.SHARED_TITLE}
                  </p>
                  <Badge variant="outline" className="fn-notifications-role-badge">
                    {roleLabel}
                  </Badge>
                </div>
                <p className="fn-workspace-invitation-desc">
                  {invite.inviter?.name
                    ? UI_COPY.WORKSPACES.INVITED_BY_LABEL(invite.inviter.name)
                    : UI_COPY.WORKSPACES.INVITATION_CARD_DESC}
                </p>
              </div>
            </div>

            <div className="fn-workspace-invitation-footer">
              <Button
                id={`decline-invite-${invite.id}`}
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  respondMutation.mutate({
                    invitationId: invite.id,
                    action: InvitationAction.REJECT,
                  })
                }
                className="fn-workspace-invitation-btn"
              >
                <X className="fn-notifications-action-icon" />
                {UI_COPY.WORKSPACES.DECLINE}
              </Button>
              <Button
                id={`accept-invite-${invite.id}`}
                size="sm"
                disabled={isPending}
                onClick={() =>
                  respondMutation.mutate({
                    invitationId: invite.id,
                    action: InvitationAction.ACCEPT,
                  })
                }
                className="fn-workspace-invitation-btn"
              >
                <Check className="fn-notifications-action-icon" />
                {UI_COPY.WORKSPACES.ACCEPT}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
