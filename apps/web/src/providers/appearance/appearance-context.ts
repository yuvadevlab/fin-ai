"use client";

import { createContext } from "react";

export interface AppearancePrefs {
  theme: "System" | "Light" | "Dark";
  density: "Comfortable" | "Compact";
}

export interface AppearanceContextValue {
  apply: (prefs: Partial<AppearancePrefs>) => void;
}

export const AppearanceContext = createContext<AppearanceContextValue>({
  apply: () => {},
});
