"use client";

import React, { useCallback, useEffect } from "react";
import { AppearanceContext, AppearancePrefs } from "./appearance-context";

const STORAGE_KEY = "finai_appearance";

const defaults: AppearancePrefs = {
  theme: "System",
  density: "Comfortable",
  numberFormat: "US",
  privacyMode: false,
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
  const [prefs, setPrefs] = React.useState<AppearancePrefs>(() => {
    if (typeof window === "undefined") return defaults;
    const stored = loadStored();
    return { ...defaults, ...stored };
  });

  const normalizePrefs = useCallback(
    (
      raw: Partial<AppearancePrefs | { privacyMode: boolean | string }>,
    ): Partial<AppearancePrefs> => {
      const result: Partial<AppearancePrefs> = { ...(raw as Partial<AppearancePrefs>) };
      if ("privacyMode" in raw) {
        if (raw.privacyMode === "Yes" || raw.privacyMode === true) {
          result.privacyMode = true;
        } else if (raw.privacyMode === "No" || raw.privacyMode === false) {
          result.privacyMode = false;
        }
      }
      return result;
    },
    [],
  );

  const apply = useCallback(
    (incoming: Partial<AppearancePrefs | { privacyMode: boolean | string }>) => {
      const normalized = normalizePrefs(incoming);
      const stored = loadStored();
      const merged: AppearancePrefs = { ...defaults, ...stored, ...normalized };
      saveStored(merged);
      setPrefs(merged);
      applyTheme(merged.theme);
      applyDensity(merged.density);
    },
    [normalizePrefs],
  );

  const togglePrivacyMode = useCallback(() => {
    apply({ privacyMode: !prefs.privacyMode });
  }, [apply, prefs.privacyMode]);

  useEffect(() => {
    applyTheme(prefs.theme);
    applyDensity(prefs.density);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = loadStored();
      if (!current.theme || current.theme === "System") {
        applyTheme("System");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [prefs.theme, prefs.density]);

  const isPrivacyMode = Boolean(prefs.privacyMode);

  return (
    <AppearanceContext.Provider
      value={{
        prefs,
        isPrivacyMode,
        apply,
        togglePrivacyMode,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export {
  AppearanceContext,
  type AppearancePrefs,
  type AppearanceContextValue,
} from "./appearance-context";
