"use client";

import React, { useCallback, useMemo, useSyncExternalStore } from "react";
import { WorkspaceContext, type WorkspaceContextValue } from "./workspace-context";
import {
  subscribe,
  getWorkspaceIdSnapshot,
  getTokenSnapshot,
  getServerSnapshot,
  writeWorkspaceId,
} from "./workspace-store";

export interface WorkspaceProviderProps {
  initialWorkspaceId: string | null;
  children: React.ReactNode;
}

export function WorkspaceProvider({ initialWorkspaceId, children }: WorkspaceProviderProps) {
  const storedWorkspaceId = useSyncExternalStore(
    subscribe,
    getWorkspaceIdSnapshot,
    getServerSnapshot,
  );
  const token = useSyncExternalStore(subscribe, getTokenSnapshot, getServerSnapshot);

  const workspaceId = storedWorkspaceId ?? initialWorkspaceId;

  const setWorkspaceId = useCallback((id: string) => {
    writeWorkspaceId(id);
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaceId,
      activeWorkspaceId: workspaceId,
      token,
      setWorkspaceId,
    }),
    [workspaceId, token, setWorkspaceId],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
