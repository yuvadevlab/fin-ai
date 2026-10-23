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
function parseJwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

function readCookieToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)(?:finai_token|devlab_access_token)=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function AuthProvider({ initialToken = null, children }: AuthProviderProps) {
  const [token] = useState<string | null>(() => {
    if (initialToken) {
      if (typeof window !== "undefined") {
        localStorage.setItem(StorageKey.TOKEN, initialToken);
        localStorage.setItem(StorageKey.DEVLAB_ACCESS_TOKEN, initialToken);
      }
      return initialToken;
    }
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem(StorageKey.TOKEN) ||
        localStorage.getItem(StorageKey.DEVLAB_ACCESS_TOKEN) ||
        localStorage.getItem(StorageKey.DEVLAB_AUTH_TOKEN);
      if (stored) return stored;

      const cookieToken = readCookieToken();
      if (cookieToken) {
        localStorage.setItem(StorageKey.TOKEN, cookieToken);
        localStorage.setItem(StorageKey.DEVLAB_ACCESS_TOKEN, cookieToken);
        return cookieToken;
      }
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
          // Fall through to JWT extraction
        }
      }

      const activeToken =
        initialToken ||
        localStorage.getItem(StorageKey.TOKEN) ||
        localStorage.getItem(StorageKey.DEVLAB_ACCESS_TOKEN) ||
        readCookieToken();

      if (activeToken) {
        const payload = parseJwtPayload(activeToken);
        if (payload && typeof payload.email === "string") {
          const authUser: AuthUser = {
            id: String(payload.sub || payload.id || ""),
            email: payload.email,
            name: typeof payload.name === "string" ? payload.name : payload.email.split("@")[0],
          };
          localStorage.setItem(StorageKey.USER, JSON.stringify(authUser));
          return authUser;
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
