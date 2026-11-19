"use client";

import React, { useState } from "react";
import { UserPlus, LogOut, Trash2, Crown, ShieldCheck, User2 } from "lucide-react";
import { Button, Badge, Avatar, AvatarFallback, AvatarImage, ConfirmDialog } from "@fin-ai/ui";
import { WorkspaceRole, WorkspaceMember } from "@fin-ai/shared-types";
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
        icon: <Crown className="fn-notifications-action-icon" />,
        className: "fn-role-owner",
      };
    case WorkspaceRole.ADMIN:
      return {
        label: UI_COPY.WORKSPACES.ROLE_ADMIN,
        icon: <ShieldCheck className="fn-notifications-action-icon" />,
        className: "fn-role-admin",
      };
    default:
      return {
        label: UI_COPY.WORKSPACES.ROLE_MEMBER,
        icon: <User2 className="fn-notifications-action-icon" />,
        className: "fn-role-member",
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
      <div className="fn-workspace-members-card">
        {/* Header */}
        <div className="fn-workspace-members-header">
          <div>
            <p className="fn-workspace-members-title">{UI_COPY.WORKSPACES.MEMBERS}</p>
            <p className="fn-workspace-members-desc">{UI_COPY.WORKSPACES.MEMBERS_DESCRIPTION}</p>
          </div>
          {isOwnerOrAdmin && (
            <Button
              id="invite-member-btn"
              size="sm"
              onClick={onInvite}
              className="fn-action-btn-sm"
            >
              <UserPlus className="fn-notifications-action-icon" />
              {UI_COPY.WORKSPACES.INVITE_MEMBER}
            </Button>
          )}
        </div>

        {/* Member rows */}
        <ul className="fn-workspace-members-list">
          {members.map((member: WorkspaceMember) => {
            const canRemove =
              isOwner || (userRole === WorkspaceRole.ADMIN && member.role === WorkspaceRole.MEMBER);
            const isSelf = member.userId === ownerId;
            const roleMeta = getRoleMeta(member.role);

            return (
              <li key={member.id} className="fn-workspace-member-item">
                {/* Avatar + info */}
                <div className="fn-workspace-member-info">
                  <Avatar className="fn-workspace-member-avatar">
                    {member.user?.avatarUrl ? (
                      <AvatarImage
                        src={member.user.avatarUrl}
                        alt={member.user?.name ?? UI_COPY.COMMON.PROFILE_MENU.FALLBACK_USER}
                      />
                    ) : null}
                    <AvatarFallback className="fn-workspace-member-avatar-fallback">
                      {member.user?.name?.slice(0, 2).toUpperCase() ??
                        UI_COPY.COMMON.PROFILE_MENU.FALLBACK_INITIAL}
                    </AvatarFallback>
                  </Avatar>
                  <div className="fn-workspace-member-content">
                    <div className="fn-workspace-member-name-row">
                      <p className="fn-workspace-member-name">
                        {member.user?.name ?? UI_COPY.COMMON.PROFILE_MENU.FALLBACK_USER}
                      </p>
                      {isSelf && (
                        <span className="fn-workspace-member-self-badge">
                          {UI_COPY.WORKSPACES.YOU_BADGE}
                        </span>
                      )}
                    </div>
                    <p className="fn-workspace-member-email">{member.user?.email}</p>
                  </div>
                </div>

                {/* Role badge + actions */}
                <div className="fn-workspace-member-actions">
                  <Badge
                    variant="outline"
                    className={`fn-workspace-member-role-badge ${roleMeta.className}`}
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
                          name: member.user?.name ?? UI_COPY.WORKSPACES.THIS_MEMBER,
                        })
                      }
                      className="fn-workspace-member-remove-btn"
                      aria-label={UI_COPY.WORKSPACES.REMOVE_MEMBER_A11Y(
                        member.user?.name ?? UI_COPY.WORKSPACES.THIS_MEMBER,
                      )}
                    >
                      <Trash2 className="fn-notifications-action-icon" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Leave footer */}
        {!isOwner && (
          <div className="fn-workspace-members-footer">
            <Button
              id="leave-workspace-btn"
              variant="ghost"
              size="sm"
              onClick={onLeave}
              className="fn-action-btn-sm"
            >
              <LogOut className="fn-notifications-action-icon" />
              {UI_COPY.WORKSPACES.LEAVE_WORKSPACE}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title={UI_COPY.WORKSPACES.REMOVE_MEMBER}
        description={UI_COPY.WORKSPACES.REMOVE_MEMBER_DESC(
          memberToRemove?.name ?? UI_COPY.WORKSPACES.THIS_MEMBER,
          workspaceName ?? UI_COPY.WORKSPACES.THIS_WORKSPACE,
        )}
        confirmText={UI_COPY.WORKSPACES.REMOVE_MEMBER}
        destructive
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
