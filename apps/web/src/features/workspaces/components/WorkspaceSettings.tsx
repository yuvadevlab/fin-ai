"use client";

import React, { useState } from "react";
import { Users, User, Shield, Crown, Plus, LogOut } from "lucide-react";
import { Button, Badge, ConfirmDialog } from "@finai/ui";
import { WorkspaceType, WorkspaceRole } from "@finai/shared-types";
import { UI_COPY } from "@/lib";
import { useWorkspace } from "@/providers";
import { useLeaveWorkspace } from "../api";
import { WorkspaceInvitationCard } from "./WorkspaceInvitationCard";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { WorkspaceMembersCard } from "./WorkspaceMembersCard";

/** Icon + colour for the active workspace role badge */
function getRoleDisplay(role?: WorkspaceRole | null) {
  if (role === WorkspaceRole.OWNER) {
    return {
      icon: <Crown className="size-3" />,
      label: UI_COPY.WORKSPACES.ROLE_OWNER,
      className: "border-primary/30 text-primary bg-primary/10",
    };
  }
  if (role === WorkspaceRole.ADMIN) {
    return {
      icon: <Shield className="size-3" />,
      label: UI_COPY.WORKSPACES.ROLE_ADMIN,
      className: "border-primary/20 text-primary/80 bg-primary/5",
    };
  }
  return {
    icon: <User className="size-3" />,
    label: UI_COPY.WORKSPACES.PERSONAL_TITLE,
    className: "border-border text-muted-foreground bg-muted/40",
  };
}

/** Full workspace management panel — rendered inside the Settings sheet. */
export function WorkspaceSettings() {
  const { activeWorkspace, activeWorkspaceId, userRole, workspaces, switchWorkspace } =
    useWorkspace();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const leaveMutation = useLeaveWorkspace();
  const isShared = activeWorkspace?.type === WorkspaceType.SHARED;
  const role = getRoleDisplay(isShared ? userRole : null);

  const handleConfirmLeave = async () => {
    if (!activeWorkspaceId) return;
    await leaveMutation.mutateAsync(activeWorkspaceId);
    setLeaveConfirmOpen(false);
    const personal = workspaces.find((w) => w.type === WorkspaceType.PERSONAL);
    if (personal) switchWorkspace(personal.id);
  };

  return (
    <div className="space-y-4">
      {/* ── Active workspace card ── */}
      <div className="bg-card ring-border/50 rounded-2xl p-5 shadow-sm ring-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <div className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
              {isShared ? <Users className="size-5" /> : <User className="size-5" />}
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                {activeWorkspace?.name ?? UI_COPY.WORKSPACES.PERSONAL_TITLE}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {isShared ? UI_COPY.WORKSPACES.SHARED_TITLE : UI_COPY.WORKSPACES.PERSONAL_TITLE}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`mt-0.5 shrink-0 gap-1 text-[10px] ${role.className}`}
          >
            {role.icon}
            {role.label}
          </Badge>
        </div>

        {/* Leave workspace action for members */}
        {isShared && userRole !== WorkspaceRole.OWNER && (
          <div className="border-border/40 mt-4 flex justify-end border-t pt-3">
            <Button
              id="leave-workspace-btn"
              variant="ghost"
              size="sm"
              onClick={() => setLeaveConfirmOpen(true)}
              className="hover:bg-destructive/10 hover:text-destructive cursor-pointer gap-1.5 text-xs transition-colors"
            >
              <LogOut className="size-3.5" />
              {UI_COPY.WORKSPACES.LEAVE_WORKSPACE}
            </Button>
          </div>
        )}
      </div>

      {/* ── Create shared workspace card ── */}
      {!isShared && (
        <div className="bg-card ring-border/50 flex flex-col gap-3 rounded-2xl p-5 shadow-sm ring-1">
          <div className="flex items-start gap-4">
            <div className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Plus className="size-5" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                {UI_COPY.WORKSPACES.CREATE_SHARED}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {UI_COPY.WORKSPACES.CREATE_DESCRIPTION}
              </p>
            </div>
          </div>
          <Button
            id="create-shared-workspace-btn"
            size="sm"
            variant="outline"
            onClick={() => setCreateOpen(true)}
            className="w-full cursor-pointer gap-1.5 text-xs font-medium"
          >
            <Plus className="size-3.5" />
            {UI_COPY.WORKSPACES.CREATE_SHARED}
          </Button>
        </div>
      )}

      {/* ── Pending invitations ── */}
      <section className="space-y-2 pt-2">
        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {UI_COPY.WORKSPACES.PENDING_INVITATIONS}
        </p>
        <WorkspaceInvitationCard showEmptyState />
      </section>

      {/* ── Members (shared workspace only) ── */}
      {isShared && activeWorkspaceId && (
        <section className="space-y-2 pt-2">
          <WorkspaceMembersCard
            workspaceId={activeWorkspaceId}
            workspaceName={activeWorkspace?.name}
            ownerId={activeWorkspace?.ownerId}
            userRole={userRole}
            onInvite={() => setInviteOpen(true)}
            onLeave={() => setLeaveConfirmOpen(true)}
          />
        </section>
      )}

      {/* ── Dialogs ── */}
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
