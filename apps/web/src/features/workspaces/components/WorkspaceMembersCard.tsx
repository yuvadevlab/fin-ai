"use client";

import React, { useState } from "react";
import { UserPlus, LogOut, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  ConfirmDialog,
} from "@finai/ui";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">{UI_COPY.WORKSPACES.MEMBERS}</CardTitle>
          <CardDescription className="text-xs">
            {UI_COPY.WORKSPACES.MEMBERS_DESCRIPTION}
          </CardDescription>
        </div>
        {isOwnerOrAdmin && (
          <Button size="sm" onClick={onInvite} className="gap-1.5 text-xs">
            <UserPlus className="size-3.5" />
            {UI_COPY.WORKSPACES.INVITE_MEMBER}
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="divide-y rounded-xl border">
          {members.map((member: WorkspaceMember) => {
            const canRemove =
              isOwner || (userRole === WorkspaceRole.ADMIN && member.role === WorkspaceRole.MEMBER);
            const isSelf = member.userId === ownerId;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    {member.user?.avatarUrl && <AvatarImage src={member.user.avatarUrl} />}
                    <AvatarFallback className="text-xs font-bold">
                      {member.user?.name?.slice(0, 2).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {member.user?.name ?? "User"}
                    </p>
                    <p className="text-muted-foreground text-xs">{member.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                  {canRemove && !isSelf && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setMemberToRemove({
                          id: member.userId,
                          name: member.user?.name ?? "this member",
                        })
                      }
                      className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground size-8 cursor-pointer rounded-lg"
                      aria-label={`Remove ${member.user?.name ?? "member"}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!isOwner && (
          <div className="flex justify-end pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onLeave}
              className="hover:bg-destructive/10 hover:text-destructive gap-1.5 text-xs"
            >
              <LogOut className="size-3.5" />
              {UI_COPY.WORKSPACES.LEAVE_WORKSPACE}
            </Button>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title={UI_COPY.WORKSPACES.REMOVE_MEMBER}
        description={`Remove ${memberToRemove?.name ?? "this member"} from ${workspaceName ?? "this workspace"}? They will lose access to shared records.`}
        confirmText={UI_COPY.WORKSPACES.REMOVE_MEMBER}
        destructive
        onConfirm={handleConfirmRemove}
      />
    </Card>
  );
}
