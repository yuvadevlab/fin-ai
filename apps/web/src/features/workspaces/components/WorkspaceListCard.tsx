"use client";

import React from "react";
import { User, Users, Check, Crown, Shield } from "lucide-react";
import { Button, Badge } from "@fin-ai/ui";
import { WorkspaceType, WorkspaceRole, type WorkspaceWithRole } from "@fin-ai/shared-types";
import { UI_COPY } from "@/lib";
import { useWorkspace } from "@/providers";

/** Get role display metadata for workspace item badge */
function getRoleBadge(role?: WorkspaceRole | null) {
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
    label: UI_COPY.WORKSPACES.ROLE_MEMBER,
    className: "fn-role-member",
  };
}

/**
 * Renders the complete list of workspaces the user belongs to with direct switching.
 * Fixes the bug where workspaces list was missing from the Settings workspace view.
 */
export function WorkspaceListCard() {
  const { workspaces, activeWorkspaceId, switchWorkspace } = useWorkspace();

  if (workspaces.length === 0) {
    return null;
  }

  return (
    <div className="fn-workspace-list-card">
      {workspaces.map((ws: WorkspaceWithRole) => {
        const isActive = ws.id === activeWorkspaceId;
        const isShared = ws.type === WorkspaceType.SHARED;
        const role = getRoleBadge(isShared ? ws.role : null);

        const memberMeta = isShared
          ? UI_COPY.WORKSPACES.MEMBER_COUNT_ROLE(ws.memberCount ?? 1, role.label)
          : UI_COPY.WORKSPACES.PERSONAL_TITLE;

        return (
          <div
            key={ws.id}
            className={`fn-workspace-list-item ${isActive ? "fn-workspace-list-item--active" : ""}`}
          >
            <div className="fn-workspace-item-left">
              <div className="fn-workspace-item-icon">
                {isShared ? (
                  <Users className="fn-notifications-action-icon" />
                ) : (
                  <User className="fn-notifications-action-icon" />
                )}
              </div>
              <div className="fn-workspace-item-details">
                <p className="fn-workspace-item-name">{ws.name}</p>
                <p className="fn-workspace-item-meta">{memberMeta}</p>
              </div>
            </div>

            <div className="fn-workspace-item-right">
              {isShared && (
                <Badge variant="outline" className={`fn-workspace-role-badge ${role.className}`}>
                  {role.icon}
                  {role.label}
                </Badge>
              )}

              {isActive ? (
                <Badge variant="outline" className="fn-workspace-active-badge">
                  <Check className="fn-notifications-action-icon" />
                  {UI_COPY.WORKSPACES.CURRENT_ACTIVE}
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => switchWorkspace(ws.id)}
                  aria-label={`${UI_COPY.WORKSPACES.SWITCH_WORKSPACE}: ${ws.name}`}
                >
                  {UI_COPY.WORKSPACES.SWITCH_ACTION}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
