"use client";

import React, { useState } from "react";
import { Users, Shield, User } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  ConfirmDialog,
} from "@finai/ui";
import { WorkspaceType } from "@finai/shared-types";
import { UI_COPY } from "@/lib";
import { useWorkspace } from "@/providers";
import { useLeaveWorkspace } from "../api";
import { WorkspaceInvitationCard } from "./WorkspaceInvitationCard";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { WorkspaceMembersCard } from "./WorkspaceMembersCard";

export function WorkspaceSettings() {
  const { activeWorkspace, activeWorkspaceId, userRole, workspaces, switchWorkspace } =
    useWorkspace();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const leaveMutation = useLeaveWorkspace();
  const isFamily = activeWorkspace?.type === WorkspaceType.FAMILY;

  const handleConfirmLeave = async () => {
    if (!activeWorkspaceId) return;
    await leaveMutation.mutateAsync(activeWorkspaceId);
    setLeaveConfirmOpen(false);
    const personal = workspaces.find((w) => w.type === WorkspaceType.PERSONAL);
    if (personal) switchWorkspace(personal.id);
  };

  return (
    <div className="space-y-6">
      {/* Pending Invitations Section */}
      <section className="space-y-3">
        <h3 className="text-foreground text-sm font-semibold">
          {UI_COPY.WORKSPACES.PENDING_INVITATIONS}
        </h3>
        <WorkspaceInvitationCard showEmptyState />
      </section>

      {/* Active Workspace Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              {activeWorkspace?.name ?? UI_COPY.WORKSPACES.PERSONAL_TITLE}
            </CardTitle>
            <CardDescription className="text-xs">
              {isFamily ? UI_COPY.WORKSPACES.FAMILY_TITLE : UI_COPY.WORKSPACES.PERSONAL_TITLE}
            </CardDescription>
          </div>
          {isFamily ? (
            <Badge variant="outline" className="gap-1 text-xs">
              <Shield className="size-3" />
              {userRole}
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 text-xs">
              <User className="size-3" />
              {UI_COPY.WORKSPACES.PERSONAL_TITLE}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {!isFamily && (
            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium">{UI_COPY.WORKSPACES.CREATE_FAMILY}</p>
                <p className="text-muted-foreground text-xs">
                  {UI_COPY.WORKSPACES.CREATE_DESCRIPTION}
                </p>
              </div>
              <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 text-xs">
                <Users className="size-3.5" />
                {UI_COPY.WORKSPACES.CREATE_FAMILY}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Workspace Member Management */}
      {isFamily && activeWorkspaceId && (
        <WorkspaceMembersCard
          workspaceId={activeWorkspaceId}
          workspaceName={activeWorkspace?.name}
          ownerId={activeWorkspace?.ownerId}
          userRole={userRole}
          onInvite={() => setInviteOpen(true)}
          onLeave={() => setLeaveConfirmOpen(true)}
        />
      )}

      {/* Dialogs */}
      {activeWorkspaceId && (
        <InviteMemberDialog
          workspaceId={activeWorkspaceId}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      )}
      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={leaveConfirmOpen}
        onOpenChange={setLeaveConfirmOpen}
        title={UI_COPY.WORKSPACES.LEAVE_WORKSPACE}
        description={UI_COPY.WORKSPACES.LEAVE_WORKSPACE_CONFIRM}
        confirmText={UI_COPY.WORKSPACES.LEAVE_WORKSPACE}
        destructive
        onConfirm={handleConfirmLeave}
      />
    </div>
  );
}
