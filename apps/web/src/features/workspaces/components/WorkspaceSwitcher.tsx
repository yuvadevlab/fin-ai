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
} from "@finai/ui";
import { WorkspaceRole, WorkspaceType } from "@finai/shared-types";
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
            className="hover:bg-secondary flex h-9 items-center gap-2 rounded-xl px-2.5 text-left text-xs sm:text-sm"
            aria-label={UI_COPY.WORKSPACES.SWITCHER_LABEL}
          >
            <div className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-lg">
              {isShared ? <Users className="size-3.5" /> : <User className="size-3.5" />}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-foreground max-w-30 truncate font-semibold sm:max-w-40">
                  {activeWorkspace?.name ?? UI_COPY.WORKSPACES.PERSONAL_TITLE}
                </span>
                {isShared && (
                  <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">
                    {roleLabel}
                  </Badge>
                )}
              </div>
            </div>
            <ChevronsUpDown className="text-muted-foreground ml-auto size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64 p-1.5 shadow-lg">
          <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
            {UI_COPY.WORKSPACES.PERSONAL_TITLE}
          </DropdownMenuLabel>
          {personalWorkspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            return (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => switchWorkspace(ws.id)}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-lg p-2"
              >
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground size-4" />
                  <span className="text-sm font-medium">{ws.name}</span>
                </div>
                {isActive && <Check className="text-primary size-4" />}
              </DropdownMenuItem>
            );
          })}

          {sharedWorkspaces.length > 0 && (
            <>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
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
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground size-4" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{ws.name}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {ws.memberCount} member{ws.memberCount === 1 ? "" : "s"} • {memberRole}
                        </span>
                      </div>
                    </div>
                    {isActive && <Check className="text-primary size-4" />}
                  </DropdownMenuItem>
                );
              })}
            </>
          )}

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            onClick={() => setCreateOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm font-medium"
          >
            <Plus className="text-primary size-4" />
            <span>{UI_COPY.WORKSPACES.CREATE_SHARED}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(APP_ROUTES.SETTINGS)}
            className="text-muted-foreground flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs"
          >
            <Settings className="size-3.5" />
            <span>{UI_COPY.WORKSPACES.MANAGE_SETTINGS}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
