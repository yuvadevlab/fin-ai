"use client";

/**
 * @file apps/web/src/features/marketing/context/EarlyAccessProvider.tsx
 * @description State provider component for the Private Beta / Early Access modal.
 * Enables any marketing CTA across headers, heroes, feature cards, and footers to open the waitlist modal.
 * @module @fin-ai/web/features/marketing/context/EarlyAccessProvider
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  EarlyAccessContext,
  EarlyAccessQueryParamKey,
  type EarlyAccessContextValue,
} from "./early-access-context";

export interface EarlyAccessProviderProps {
  children: React.ReactNode;
}

/**
 * Provides early access modal state throughout the marketing layout tree.
 * Automatically inspects location query parameters on mount to auto-open when redirected.
 */
export function EarlyAccessProvider({ children }: EarlyAccessProviderProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Check for auto-open query trigger on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const trigger = params.get(EarlyAccessQueryParamKey.EARLY_ACCESS);
      if (trigger === "true" || trigger === "1") {
        queueMicrotask(() => {
          setIsOpen(true);
        });
      }
    }
  }, []);

  const value = useMemo<EarlyAccessContextValue>(
    () => ({
      isOpen,
      openModal,
      closeModal,
    }),
    [isOpen, openModal, closeModal],
  );

  return <EarlyAccessContext.Provider value={value}>{children}</EarlyAccessContext.Provider>;
}
