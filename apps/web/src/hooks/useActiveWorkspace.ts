"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { writeWorkspaceId } from "@/providers/workspace/workspace-store";
import { useEffect, useState, useMemo, useCallback } from "react";

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}

export interface Workspace {
  id: string;
  name: string;
  type: "PERSONAL" | "FAMILY";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members?: WorkspaceMember[];
}

export function useActiveWorkspace() {
  const { data: workspaces, isLoading } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: () => apiClient.get<Workspace[]>("workspaces"),
    retry: false,
  });

  const [activeId, setActiveIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("finai_workspace_id");
    }
    return null;
  });

  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !activeId) {
      const storedId = localStorage.getItem("finai_workspace_id");
      if (storedId) {
        Promise.resolve().then(() => {
          setActiveIdState(storedId);
        });
      } else {
        const firstId = workspaces[0].id;
        localStorage.setItem("finai_workspace_id", firstId);
        document.cookie = `finai_workspace_id=${firstId}; path=/; max-age=604800; SameSite=Lax`;
        Promise.resolve().then(() => {
          setActiveIdState(firstId);
        });
      }
    }
  }, [workspaces, activeId]);

  const setActiveWorkspaceId = useCallback((id: string) => {
    writeWorkspaceId(id);
    setActiveIdState(id);
    window.location.reload();
  }, []);

  const activeWorkspace = useMemo(() => {
    if (!workspaces || !activeId) return undefined;
    return workspaces.find((w) => w.id === activeId);
  }, [workspaces, activeId]);

  return {
    workspaces,
    activeWorkspace,
    activeWorkspaceId: activeId,
    setActiveWorkspaceId,
    isLoading,
  };
}
