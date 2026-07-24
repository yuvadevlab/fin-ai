"use client";

import { useEffect } from "react";
import { useProfile } from "@/features/settings/api/profile";
import { useAppearance } from "@/hooks/useAppearance";
import type { AppearancePrefs } from "@/providers/appearance/appearance-context";

/**
 * Syncs the user's stored appearance preferences from the server
 * into the DOM (theme class on <html>, density class on <body>).
 * Must be mounted inside both AppearanceProvider and QueryProvider.
 */
export function AppearanceSync() {
  const { data: profile } = useProfile();
  const { apply } = useAppearance();

  useEffect(() => {
    if (!profile?.preferences?.appearance) return;
    apply(profile.preferences.appearance as Partial<AppearancePrefs>);
  }, [profile, apply]);

  return null;
}
