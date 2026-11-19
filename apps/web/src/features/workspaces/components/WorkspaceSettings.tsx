"use client";

import React, { useState } from "react";
import { Users, User, Shield, Crown, Plus, LogOut } from "lucide-react";
import { Button, Badge, ConfirmDialog } from "@fin-ai/ui";
import { WorkspaceType, WorkspaceRole } from "@fin-ai/shared-types";
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
      icon: <Crown className="fn-notifications-action-icon" />,
      label: UI_COPY.WORKSPACES.ROLE_OWNER,
      className: "fn-role-owner",
    };
  }
  if (role === WorkspaceRole.ADMIN) {
    return {
      icon: <Shield className="fn-notifications-action-icon" />,
      label: UI_COPY.WORKSPACES.ROLE_ADMIN,
      className: "fn-role-admin",
    };
  }
  return {
    icon: <User className="fn-notifications-action-icon" />,
    label: UI_COPY.WORKSPACES.PERSONAL_TITLE,
    className: "fn-role-member",
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
    <div className="fn-workspace-settings-container">
      {/* ── Active workspace card ── */}
      <div className="fn-workspace-card">
        <div className="fn-workspace-header">
          <div className="fn-workspace-info">
            <div className="fn-workspace-avatar">
              {isShared ? (
                <Users className="fn-notifications-action-icon" />
              ) : (
                <User className="fn-notifications-action-icon" />
              )}
            </div>
            <div>
              <p className="fn-workspace-name">
                {activeWorkspace?.name ?? UI_COPY.WORKSPACES.PERSONAL_TITLE}
              </p>
              <p className="fn-workspace-type">
                {isShared ? UI_COPY.WORKSPACES.SHARED_TITLE : UI_COPY.WORKSPACES.PERSONAL_TITLE}
              </p>
            </div>
          </div>

          <Badge variant="outline" className={`fn-workspace-role-badge ${role.className}`}>
            {role.icon}
            {role.label}
          </Badge>
        </div>

        {/* Leave workspace action for members */}
        {isShared && userRole !== WorkspaceRole.OWNER && (
          <div className="fn-workspace-actions">
            <Button
              id="leave-workspace-btn"
              variant="ghost"
              size="sm"
              onClick={() => setLeaveConfirmOpen(true)}
              className="fn-workspace-leave-btn"
            >
              <LogOut className="fn-notifications-action-icon" />
              {UI_COPY.WORKSPACES.LEAVE_WORKSPACE}
            </Button>
          </div>
        )}
      </div>

      {/* ── Create shared workspace card ── */}
      {!isShared && (
        <div className="fn-workspace-create-card">
          <div className="fn-workspace-info">
            <div className="fn-workspace-avatar">
              <Plus className="fn-notifications-action-icon" />
            </div>
            <div>
              <p className="fn-workspace-name">{UI_COPY.WORKSPACES.CREATE_SHARED}</p>
              <p className="fn-workspace-type">{UI_COPY.WORKSPACES.CREATE_DESCRIPTION}</p>
            </div>
          </div>
          <Button
            id="create-shared-workspace-btn"
            size="sm"
            variant="outline"
            onClick={() => setCreateOpen(true)}
            className="fn-workspace-create-btn"
          >
            <Plus className="fn-notifications-action-icon" />
            {UI_COPY.WORKSPACES.CREATE_SHARED}
          </Button>
        </div>
      )}

      {/* ── Pending invitations ── */}
      <section className="fn-workspace-section">
        <p className="fn-workspace-section-title">{UI_COPY.WORKSPACES.PENDING_INVITATIONS}</p>
        <WorkspaceInvitationCard showEmptyState />
      </section>

      {/* ── Members (shared workspace only) ── */}
      {isShared && activeWorkspaceId && (
        <section className="fn-workspace-section">
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
