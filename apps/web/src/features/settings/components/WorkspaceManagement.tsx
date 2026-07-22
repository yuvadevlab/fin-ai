"use client";

import React from "react";
import { Badge } from "@finai/ui";
import { type Workspace } from "@/hooks/useActiveWorkspace";

export function WorkspaceManagement({
  workspaces,
  activeWorkspace,
}: {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null | undefined;
}) {
  return (
    <ul className="space-y-3">
      {(workspaces ?? []).map((w) => (
        <li
          key={w.id}
          className="border-border flex items-center justify-between rounded-xl border p-4"
        >
          <div>
            <p className="text-sm font-semibold">{w.name}</p>
            <p className="text-muted-foreground text-xs">
              {w.type === "PERSONAL" ? "Just you" : "Family"} · {w.members?.length ?? 1} member
              {(w.members?.length ?? 1) > 1 ? "s" : ""}
            </p>
          </div>
          {activeWorkspace?.id === w.id ? <Badge variant="secondary">Active</Badge> : null}
        </li>
      ))}
    </ul>
  );
}
