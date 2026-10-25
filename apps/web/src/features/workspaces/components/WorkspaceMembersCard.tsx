"use client";

import React, { useState } from "react";
import { UserPlus, LogOut, Trash2, Crown, ShieldCheck, User2 } from "lucide-react";
import { Button, Badge, Avatar, AvatarFallback, AvatarImage, ConfirmDialog } from "@finai/ui";
import { WorkspaceRole, WorkspaceMember } from "@finai/shared-types";
import { UI_COPY } from "@/lib";
import { useWorkspaceMembers, useRemoveMember } from "../api";

interface WorkspaceMembersCardProps {
  workspaceId: string;
  workspaceName?: string;
  ownerId?: string;
  userRole?: WorkspaceRole | null;
  onInvite: () => void;
  onLeave: () => void;
}

/** Role meta: icon + colour variant for the badge */
function getRoleMeta(role: WorkspaceRole) {
  switch (role) {
    case WorkspaceRole.OWNER:
      return {
        label: UI_COPY.WORKSPACES.ROLE_OWNER,
        icon: <Crown className="size-2.5" />,
        className: "border-primary/30 text-primary bg-primary/10",
      };
    case WorkspaceRole.ADMIN:
      return {
        label: UI_COPY.WORKSPACES.ROLE_ADMIN,
        icon: <ShieldCheck className="size-2.5" />,
        className: "border-[hsl(var(--primary)/0.35)] text-primary bg-[hsl(var(--primary)/0.08)]",
      };
    default:
      return {
        label: UI_COPY.WORKSPACES.ROLE_MEMBER,
        icon: <User2 className="size-2.5" />,
        className: "border-border text-muted-foreground bg-muted/40",
      };
  }
}

/** Shared workspace member list with invite / remove / leave actions. */
export function WorkspaceMembersCard({
  workspaceId,
  workspaceName,
  ownerId,
  userRole,
  onInvite,
  onLeave,
}: WorkspaceMembersCardProps) {
  const { data: members = [] } = useWorkspaceMembers(workspaceId);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const removeMemberMutation = useRemoveMember();

  const isOwner = userRole === WorkspaceRole.OWNER;
  const isOwnerOrAdmin = isOwner || userRole === WorkspaceRole.ADMIN;

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    await removeMemberMutation.mutateAsync({
      workspaceId,
      memberUserId: memberToRemove.id,
    });
    setMemberToRemove(null);
  };

  return (
    <>
      <div className="bg-card ring-border/50 overflow-hidden rounded-2xl shadow-sm ring-1">
        {/* Header */}
        <div className="border-border/50 flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-sm font-semibold">{UI_COPY.WORKSPACES.MEMBERS}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {UI_COPY.WORKSPACES.MEMBERS_DESCRIPTION}
            </p>
          </div>
          {isOwnerOrAdmin && (
            <Button
              id="invite-member-btn"
              size="sm"
              onClick={onInvite}
              className="gap-1.5 text-xs shadow-sm"
            >
              <UserPlus className="size-3.5" />
              {UI_COPY.WORKSPACES.INVITE_MEMBER}
            </Button>
          )}
        </div>

        {/* Member rows */}
        <ul className="divide-y">
          {members.map((member: WorkspaceMember) => {
            const canRemove =
              isOwner || (userRole === WorkspaceRole.ADMIN && member.role === WorkspaceRole.MEMBER);
            const isSelf = member.userId === ownerId;
            const roleMeta = getRoleMeta(member.role);

            return (
              <li
                key={member.id}
                className="group hover:bg-muted/30 flex items-center justify-between gap-3 px-4 py-3 transition-colors sm:px-5"
              >
                {/* Avatar + info */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="ring-background size-9 shrink-0 shadow-2xs ring-1">
                    {member.user?.avatarUrl ? (
                      <AvatarImage src={member.user.avatarUrl} alt={member.user?.name ?? "User"} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {member.user?.name?.slice(0, 2).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-foreground truncate text-sm leading-none font-medium">
                        {member.user?.name ?? "User"}
                      </p>
                      {isSelf && (
                        <span className="text-muted-foreground/70 shrink-0 text-[10px] font-normal">
                          (you)
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {member.user?.email}
                    </p>
                  </div>
                </div>

                {/* Role badge + actions */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`shrink-0 gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap shadow-2xs ${roleMeta.className}`}
                  >
                    {roleMeta.icon}
                    <span>{roleMeta.label}</span>
                  </Badge>

                  {canRemove && !isSelf && (
                    <Button
                      id={`remove-member-${member.id}`}
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setMemberToRemove({
                          id: member.userId,
                          name: member.user?.name ?? "this member",
                        })
                      }
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-7 shrink-0 cursor-pointer rounded-lg transition-all"
                      aria-label={`Remove ${member.user?.name ?? "member"}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Leave footer */}
        {!isOwner && (
          <div className="flex justify-end border-t px-5 py-3">
            <Button
              id="leave-workspace-btn"
              variant="ghost"
              size="sm"
              onClick={onLeave}
              className="hover:bg-destructive/10 hover:text-destructive gap-1.5 text-xs transition-colors"
            >
              <LogOut className="size-3.5" />
              {UI_COPY.WORKSPACES.LEAVE_WORKSPACE}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title={UI_COPY.WORKSPACES.REMOVE_MEMBER}
        description={`Remove ${memberToRemove?.name ?? "this member"} from ${workspaceName ?? "this workspace"}? They will lose access to shared records.`}
        confirmText={UI_COPY.WORKSPACES.REMOVE_MEMBER}
        destructive
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
