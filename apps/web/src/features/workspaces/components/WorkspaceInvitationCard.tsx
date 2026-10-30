"use client";

import React from "react";
import { Users, Check, X, Mail } from "lucide-react";
import { Button, Badge } from "@finai/ui";
import { UI_COPY } from "@/lib";
import { useMyInvitations, useRespondInvitation } from "../api";
import { WorkspaceRole, InvitationAction } from "@finai/shared-types";

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
      <div
        className={`bg-card ring-border/50 flex flex-col items-center gap-2 rounded-2xl p-6 text-center shadow-xs ring-1 ${className ?? ""}`}
      >
        <div className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-xl">
          <Mail className="size-5" />
        </div>
        <p className="text-muted-foreground text-sm">{UI_COPY.WORKSPACES.NO_PENDING_INVITATIONS}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      {invitations.map((invite) => {
        const roleLabel =
          invite.role === WorkspaceRole.ADMIN
            ? UI_COPY.WORKSPACES.ROLE_ADMIN
            : UI_COPY.WORKSPACES.ROLE_MEMBER;

        const isPending = respondMutation.isPending;

        return (
          <div
            key={invite.id}
            className="bg-card ring-border/50 hover:ring-primary/20 flex flex-col gap-4 rounded-2xl p-5 shadow-sm ring-1 transition outline-none"
          >
            <div className="flex items-start gap-4">
              <div className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Users className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {invite.workspace?.name ?? UI_COPY.WORKSPACES.SHARED_TITLE}
                  </p>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {roleLabel}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {invite.inviter?.name
                    ? `Invited by ${invite.inviter.name}`
                    : UI_COPY.WORKSPACES.INVITATION_CARD_DESC}
                </p>
              </div>
            </div>

            <div className="border-border/40 flex items-center justify-end gap-2 border-t pt-3">
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
                className="cursor-pointer gap-1.5 text-xs font-medium"
              >
                <X className="size-3.5" />
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
                className="cursor-pointer gap-1.5 text-xs font-medium shadow-xs"
              >
                <Check className="size-3.5" />
                {UI_COPY.WORKSPACES.ACCEPT}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
