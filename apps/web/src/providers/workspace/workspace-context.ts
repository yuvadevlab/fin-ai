"use client";
import { createContext, useContext } from "react";

export interface Workspace {
  id: string;
  name: string;
  type: "PERSONAL" | "FAMILY";
  ownerId: string;
}

export interface WorkspaceContextValue {
  workspaceId: string | null;
  activeWorkspaceId: string | null;
  token: string | null;
  setWorkspaceId: (id: string) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  }
  return context;
}
