"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { StorageKey, WorkspaceRole, WorkspaceType, QUERY_KEYS } from "@finai/shared-types";
import { useWorkspaces } from "@/features/workspaces/api";
import { WorkspaceContext } from "./workspace-context";

export interface WorkspaceProviderProps {
  children: React.ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const queryClient = useQueryClient();
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(StorageKey.WORKSPACE_ID);
    }
    return null;
  });

  // Derived active workspace: match selected id, or fall back to personal/first workspace
  const activeWorkspace = useMemo(() => {
    if (workspaces.length === 0) return null;
    const match = workspaces.find((w) => w.id === selectedWorkspaceId);
    if (match) return match;
    return workspaces.find((w) => w.type === WorkspaceType.PERSONAL) ?? workspaces[0] ?? null;
  }, [workspaces, selectedWorkspaceId]);

  const activeWorkspaceId = activeWorkspace?.id ?? null;

  // Synchronize localStorage and document.cookie without setting state inside the effect
  useEffect(() => {
    if (!activeWorkspaceId || typeof window === "undefined") return;
    const currentStored = localStorage.getItem(StorageKey.WORKSPACE_ID);
    if (currentStored !== activeWorkspaceId) {
      localStorage.setItem(StorageKey.WORKSPACE_ID, activeWorkspaceId);
      document.cookie = `${StorageKey.WORKSPACE_ID}=${encodeURIComponent(activeWorkspaceId)}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [activeWorkspaceId]);

  const userRole = activeWorkspace?.role ?? null;
  const isReadOnly = Boolean(
    activeWorkspace?.type === WorkspaceType.FAMILY && userRole === WorkspaceRole.MEMBER,
  );

  const switchWorkspace = useCallback(
    (workspaceId: string) => {
      setSelectedWorkspaceId(workspaceId);
      if (typeof window !== "undefined") {
        localStorage.setItem(StorageKey.WORKSPACE_ID, workspaceId);
        document.cookie = `${StorageKey.WORKSPACE_ID}=${encodeURIComponent(workspaceId)}; path=/; max-age=31536000; SameSite=Lax`;
      }

      // Refresh all financial and dashboard queries for the newly selected workspace
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOALS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVESTMENTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.ALL });
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({
      activeWorkspaceId,
      activeWorkspace,
      workspaces,
      isLoading,
      userRole,
      isReadOnly,
      switchWorkspace,
    }),
    [
      activeWorkspaceId,
      activeWorkspace,
      workspaces,
      isLoading,
      userRole,
      isReadOnly,
      switchWorkspace,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
