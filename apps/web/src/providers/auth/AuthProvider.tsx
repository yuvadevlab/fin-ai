"use client";

import React, { useCallback, useState, useMemo } from "react";
import { DevLabAuthProvider } from "@yuva-devlab/auth-client";
import { StorageKey } from "@finai/shared-types";
import { APP_ID, APP_ROUTES } from "@/lib";
import { AuthContext, type AuthContextValue, type AuthUser } from "./auth-context";

export interface AuthProviderProps {
  initialToken?: string | null;
  children: React.ReactNode;
}

/**
 * Authentication context provider wrapping both legacy token state and the
 * centralized DevLab platform auth provider with platform kill-switch support.
 */
export function AuthProvider({ initialToken = null, children }: AuthProviderProps) {
  const [token] = useState<string | null>(() => {
    if (initialToken) return initialToken;
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem(StorageKey.TOKEN) ||
        localStorage.getItem(StorageKey.DEVLAB_ACCESS_TOKEN) ||
        localStorage.getItem(StorageKey.DEVLAB_AUTH_TOKEN)
      );
    }
    return null;
  });

  const [user] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser =
        localStorage.getItem(StorageKey.USER) || localStorage.getItem(StorageKey.DEVLAB_AUTH_USER);
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(StorageKey.TOKEN);
      localStorage.removeItem(StorageKey.USER);
      localStorage.removeItem(StorageKey.DEVLAB_ACCESS_TOKEN);
      localStorage.removeItem(StorageKey.DEVLAB_AUTH_TOKEN);
      localStorage.removeItem(StorageKey.DEVLAB_AUTH_USER);
      document.cookie = `${StorageKey.TOKEN}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `${StorageKey.DEVLAB_ACCESS_TOKEN}=; path=/; max-age=0; SameSite=Lax`;
      window.location.href = APP_ROUTES.LOGIN;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      logout,
    }),
    [token, user, logout],
  );

  return (
    <DevLabAuthProvider appId={APP_ID}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </DevLabAuthProvider>
  );
}
