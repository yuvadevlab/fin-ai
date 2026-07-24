"use client";

import React, { useCallback, useEffect } from "react";
import { AppearanceContext, AppearancePrefs } from "./appearance-context";

const STORAGE_KEY = "finai_appearance";

const defaults: AppearancePrefs = {
  theme: "System",
  density: "Comfortable",
};

function resolveTheme(theme: string): "dark" | "light" {
  if (theme === "Dark") return "dark";
  if (theme === "Light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: string) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function applyDensity(density: string) {
  document.body.classList.toggle("density-compact", density === "Compact");
}

function loadStored(): Partial<AppearancePrefs> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<AppearancePrefs>) : {};
  } catch {
    return {};
  }
}

function saveStored(prefs: Partial<AppearancePrefs>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const apply = useCallback((incoming: Partial<AppearancePrefs>) => {
    const stored = loadStored();
    const merged = { ...defaults, ...stored, ...incoming };
    saveStored(merged);
    applyTheme(merged.theme);
    applyDensity(merged.density);
  }, []);

  useEffect(() => {
    const stored = loadStored();
    applyTheme(stored.theme ?? defaults.theme);
    applyDensity(stored.density ?? defaults.density);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = loadStored();
      if (!current.theme || current.theme === "System") {
        applyTheme("System");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return <AppearanceContext.Provider value={{ apply }}>{children}</AppearanceContext.Provider>;
}

export {
  AppearanceContext,
  type AppearancePrefs,
  type AppearanceContextValue,
} from "./appearance-context";
