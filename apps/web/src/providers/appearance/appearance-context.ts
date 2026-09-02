"use client";

import { createContext } from "react";

export interface AppearancePrefs {
  theme: "System" | "Light" | "Dark";
  density: "Comfortable" | "Compact";
  numberFormat: "Indian" | "US";
  privacyMode: boolean;
}

export interface AppearanceContextValue {
  prefs: AppearancePrefs;
  isPrivacyMode: boolean;
  apply: (prefs: Partial<AppearancePrefs | { privacyMode: boolean | string }>) => void;
  togglePrivacyMode: () => void;
}

export const AppearanceContext = createContext<AppearanceContextValue>({
  prefs: {
    theme: "System",
    density: "Comfortable",
    numberFormat: "Indian",
    privacyMode: false,
  },
  isPrivacyMode: false,
  apply: () => {},
  togglePrivacyMode: () => {},
});
