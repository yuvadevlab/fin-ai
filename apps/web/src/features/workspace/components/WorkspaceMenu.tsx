"use client";

import { useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@finai/ui";
import { useActiveWorkspace, type Workspace } from "@/hooks";
import { WorkspaceDialog } from "./WorkspaceDialog";

function getWorkspaceRoleLabel(workspace: Workspace, userId: string | null): string {
  const memberCount = workspace.members?.length ?? 1;
  if (memberCount <= 1 || workspace.type === "PERSONAL") {
    return "Just you";
  }
  if (userId && workspace.ownerId === userId) {
    return "Owner";
  }
  const membership = workspace.members?.find((m) => m.userId === userId);
  if (membership?.role === "OWNER" || membership?.role === "ADMIN") {
    return "Owner";
  }
  return "Member";
}

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("finai_user");
    if (!raw) return null;
    const user = JSON.parse(raw) as { id?: string };
    return user.id ?? null;
  } catch {
    return null;
  }
}

export function WorkspaceMenu() {
  const { workspaces, activeWorkspace, activeWorkspaceId, setActiveWorkspaceId, isLoading } =
    useActiveWorkspace();
  const userId = getCurrentUserId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading || !activeWorkspace) {
    return (
      <div className="bg-secondary ring-border/80 flex items-center gap-2 rounded-md px-3 py-1.5 ring-1">
        <span className="bg-primary size-2 rounded-full" />
        <span className="text-foreground text-xs font-semibold">Loading…</span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="bg-secondary ring-border/80 hover:bg-secondary/80 focus-visible:ring-ring flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 ring-1 transition outline-none">
            <span className="bg-primary size-2 rounded-full" />
            <span className="text-foreground text-xs font-semibold">{activeWorkspace.name}</span>
            <ChevronDown className="text-muted-foreground size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
            Switch workspace
          </DropdownMenuLabel>
          {(workspaces ?? []).map((w) => {
            const role = getWorkspaceRoleLabel(w, userId);
            const members = w.members?.length ?? 1;
            return (
              <DropdownMenuItem
                key={w.id}
                className="flex cursor-pointer items-start gap-2 py-2"
                onSelect={() => {
                  if (w.id !== activeWorkspaceId) {
                    setActiveWorkspaceId(w.id);
                  }
                }}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{w.name}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {role} · {members} member{members > 1 ? "s" : ""}
                  </p>
                </div>
                {activeWorkspaceId === w.id ? <Check className="text-primary mt-1 size-4" /> : null}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setIsDialogOpen(true)}
            className="cursor-pointer gap-2 text-sm"
          >
            <Plus className="size-4" /> New workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <WorkspaceDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
