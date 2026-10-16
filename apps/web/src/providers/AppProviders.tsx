"use client";

import React from "react";
import { Toaster } from "@finai/ui";
import { QueryProvider } from "./query/QueryProvider";
import { AuthProvider } from "./auth/AuthProvider";
import { AppearanceProvider } from "./appearance/AppearanceProvider";

export interface AppProvidersProps {
  /**
   * Optional initial authentication token for SSR hydration.
   */
  initialToken?: string | null;
  /**
   * Child React nodes to render inside the provider tree.
   */
  children: React.ReactNode;
}

/**
 * Unified application client providers wrapper.
 * Encapsulates TanStack Query, DevLab Auth, Appearance (theme/density/privacy),
 * and toast notification providers into a single client-boundary tree.
 */
export function AppProviders({ initialToken, children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider initialToken={initialToken}>
        <AppearanceProvider>
          {children}
          <Toaster />
        </AppearanceProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
