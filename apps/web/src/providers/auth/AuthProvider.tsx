"use client";

import React, { useCallback, useState, useMemo } from "react";
import { AuthContext, type AuthContextValue, type AuthUser } from "./auth-context";

export interface AuthProviderProps {
  initialToken?: string | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialToken = null, children }: AuthProviderProps) {
  const [token] = useState<string | null>(() => {
    if (initialToken) return initialToken;
    if (typeof window !== "undefined") {
      return localStorage.getItem("finai_token");
    }
    return null;
  });

  const [user] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("finai_user");
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
      localStorage.removeItem("finai_token");
      localStorage.removeItem("finai_user");
      document.cookie = "finai_token=; path=/; max-age=0";
      window.location.href = "/login";
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
