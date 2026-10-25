"use client";

import { createContext, useContext } from "react";
import type { WorkspaceRole, WorkspaceWithRole } from "@finai/shared-types";

export interface WorkspaceContextValue {
  activeWorkspaceId: string | null;
  activeWorkspace: WorkspaceWithRole | null;
  workspaces: WorkspaceWithRole[];
  isLoading: boolean;
  userRole: WorkspaceRole | null;
  isReadOnly: boolean;
  switchWorkspace: (workspaceId: string) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
