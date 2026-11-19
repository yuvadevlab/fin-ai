"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Users, Check, Plus, Settings, ChevronsUpDown } from "lucide-react";
import {
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@fin-ai/ui";
import { WorkspaceRole, WorkspaceType } from "@fin-ai/shared-types";
import { UI_COPY, APP_ROUTES } from "@/lib";
import { useWorkspace } from "@/providers";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";

export function WorkspaceSwitcher() {
  const router = useRouter();
  const { workspaces, activeWorkspace, activeWorkspaceId, switchWorkspace, userRole } =
    useWorkspace();
  const [createOpen, setCreateOpen] = useState(false);

  const personalWorkspaces = workspaces.filter((w) => w.type === WorkspaceType.PERSONAL);
  const sharedWorkspaces = workspaces.filter((w) => w.type === WorkspaceType.SHARED);

  const isShared = activeWorkspace?.type === WorkspaceType.SHARED;
  const roleLabel =
    userRole === WorkspaceRole.OWNER
      ? UI_COPY.WORKSPACES.ROLE_OWNER
      : userRole === WorkspaceRole.ADMIN
        ? UI_COPY.WORKSPACES.ROLE_ADMIN
        : UI_COPY.WORKSPACES.ROLE_MEMBER;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fn-workspace-switcher-trigger"
            aria-label={UI_COPY.WORKSPACES.SWITCHER_LABEL}
          >
            <div className="fn-workspace-switcher-icon">
              {isShared ? (
                <Users className="fn-notifications-action-icon" />
              ) : (
                <User className="fn-notifications-action-icon" />
              )}
            </div>
            <div className="fn-workspace-switcher-label-wrap">
              <div className="fn-workspace-switcher-row">
                <span className="fn-workspace-switcher-name">
                  {activeWorkspace?.name ?? UI_COPY.WORKSPACES.PERSONAL_TITLE}
                </span>
                {isShared && (
                  <Badge variant="outline" className="fn-workspace-switcher-badge">
                    {roleLabel}
                  </Badge>
                )}
              </div>
            </div>
            <ChevronsUpDown className="fn-workspace-switcher-chevron" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="fn-workspace-switcher-menu">
          <DropdownMenuLabel className="fn-workspace-switcher-group-label">
            {UI_COPY.WORKSPACES.PERSONAL_TITLE}
          </DropdownMenuLabel>
          {personalWorkspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            return (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => switchWorkspace(ws.id)}
                className="fn-workspace-switcher-item"
              >
                <div className="fn-workspace-switcher-item-left">
                  <User className="fn-notifications-action-icon fn-icon--muted" />
                  <span className="fn-workspace-switcher-item-name">{ws.name}</span>
                </div>
                {isActive && <Check className="fn-notifications-action-icon fn-icon--primary" />}
              </DropdownMenuItem>
            );
          })}

          {sharedWorkspaces.length > 0 && (
            <>
              <DropdownMenuSeparator className="fn-workspace-switcher-sep" />
              <DropdownMenuLabel className="fn-workspace-switcher-group-label">
                {UI_COPY.WORKSPACES.SHARED_TITLE}
              </DropdownMenuLabel>
              {sharedWorkspaces.map((ws) => {
                const isActive = ws.id === activeWorkspaceId;
                const memberRole =
                  ws.role === WorkspaceRole.OWNER
                    ? UI_COPY.WORKSPACES.ROLE_OWNER
                    : ws.role === WorkspaceRole.ADMIN
                      ? UI_COPY.WORKSPACES.ROLE_ADMIN
                      : UI_COPY.WORKSPACES.ROLE_MEMBER;

                return (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => switchWorkspace(ws.id)}
                    className="fn-workspace-switcher-item"
                  >
                    <div className="fn-workspace-switcher-item-left">
                      <Users className="fn-notifications-action-icon fn-icon--muted" />
                      <div className="fn-workspace-switcher-label-wrap">
                        <span className="fn-workspace-switcher-item-name">{ws.name}</span>
                        <span className="fn-workspace-switcher-item-meta">
                          {UI_COPY.WORKSPACES.MEMBER_COUNT_ROLE(ws.memberCount, memberRole)}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <Check className="fn-notifications-action-icon fn-icon--primary" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </>
          )}

          <DropdownMenuSeparator className="fn-workspace-switcher-sep" />

          <DropdownMenuItem
            onClick={() => setCreateOpen(true)}
            className="fn-workspace-switcher-action-item"
          >
            <Plus className="fn-notifications-action-icon fn-icon--primary" />
            <span>{UI_COPY.WORKSPACES.CREATE_SHARED}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(APP_ROUTES.SETTINGS)}
            className="fn-workspace-switcher-settings-item"
          >
            <Settings className="fn-notifications-action-icon" />
            <span>{UI_COPY.WORKSPACES.MANAGE_SETTINGS}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
