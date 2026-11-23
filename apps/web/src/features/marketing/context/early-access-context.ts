"use client";

/**
 * @file apps/web/src/features/marketing/context/early-access-context.ts
 * @description React Context definition, query key constants, and consumer hook for Early Access modal.
 * @module @fin-ai/web/features/marketing/context/early-access-context
 */

import { createContext, useContext } from "react";

/** Query parameter key constant for opening early access programmatically */
export const EarlyAccessQueryParamKey = {
  EARLY_ACCESS: "early-access",
} as const;
export type EarlyAccessQueryParamKey =
  (typeof EarlyAccessQueryParamKey)[keyof typeof EarlyAccessQueryParamKey];

export interface EarlyAccessContextValue {
  /** Whether the early access modal is currently open */
  isOpen: boolean;
  /** Opens the early access waitlist modal */
  openModal: () => void;
  /** Closes the early access waitlist modal */
  closeModal: () => void;
}

export const EarlyAccessContext = createContext<EarlyAccessContextValue | null>(null);

/**
 * Hook to access early access waitlist modal controls.
 * @throws Error if used outside an EarlyAccessProvider
 */
export function useEarlyAccess(): EarlyAccessContextValue {
  const context = useContext(EarlyAccessContext);
  if (!context) {
    throw new Error("useEarlyAccess must be used within an EarlyAccessProvider");
  }
  return context;
}
