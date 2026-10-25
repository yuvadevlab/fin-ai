"use client";

import React from "react";
import { Users, Check, X, Mail } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@finai/ui";
import { UI_COPY } from "@/lib";
import { useMyInvitations, useRespondInvitation } from "../api";
import { WorkspaceRole } from "@finai/shared-types";

interface WorkspaceInvitationCardProps {
  className?: string;
  showEmptyState?: boolean;
}

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
      <Card className={className}>
        <CardContent className="p-4 text-center">
          <Mail className="text-muted-foreground mx-auto mb-2 size-6" />
          <p className="text-muted-foreground text-sm">
            {UI_COPY.WORKSPACES.NO_PENDING_INVITATIONS}
          </p>
        </CardContent>
      </Card>
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
          <Card key={invite.id} className="border-primary/30 bg-primary/5 shadow-xs transition-all">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <Users className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-semibold">
                      {invite.workspace?.name ?? UI_COPY.WORKSPACES.FAMILY_TITLE}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {roleLabel}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {invite.inviter?.name
                      ? `Invited by ${invite.inviter.name}`
                      : UI_COPY.WORKSPACES.INVITATION_CARD_DESC}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() =>
                    respondMutation.mutate({
                      invitationId: invite.id,
                      action: "reject",
                    })
                  }
                  className="gap-1.5 text-xs"
                >
                  <X className="size-3.5" />
                  {UI_COPY.WORKSPACES.DECLINE}
                </Button>
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    respondMutation.mutate({
                      invitationId: invite.id,
                      action: "accept",
                    })
                  }
                  className="gap-1.5 text-xs"
                >
                  <Check className="size-3.5" />
                  {UI_COPY.WORKSPACES.ACCEPT}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
