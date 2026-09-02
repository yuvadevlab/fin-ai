"use client";

import { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

export interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
