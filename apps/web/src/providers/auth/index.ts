/**
 * @file apps/web/src/providers/auth/index.ts
 * @description Central export point for AuthProvider and useAuth context.
 * @module @fin-ai/web/providers/auth
 */

export { AuthProvider, type AuthProviderProps } from "./AuthProvider";
export { useAuth, AuthContext, type AuthContextValue, type AuthUser } from "./auth-context";
