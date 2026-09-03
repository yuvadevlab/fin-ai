"use client";

import React, { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { AppearanceContext, AppearancePrefs } from "./appearance-context";

const STORAGE_KEY = "finai_appearance";

const defaults: AppearancePrefs = {
  theme: "System",
  density: "Comfortable",
  numberFormat: "US",
  privacyMode: false,
};

let listeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  listeners.push(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
    window.removeEventListener("storage", onStorage);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

function getClientSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshot(): string {
  return "";
}

function resolveTheme(theme: string): "dark" | "light" {
  if (theme === "Dark") return "dark";
  if (theme === "Light") return "light";
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

function applyTheme(theme: string) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function applyDensity(density: string) {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("density-compact", density === "Compact");
}

function saveStored(prefs: Partial<AppearancePrefs>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    notify();
  } catch {
    // ignore
  }
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  // Use React's useSyncExternalStore to subscribe to localStorage without cascading render effects
  const rawStored = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const prefs = useMemo<AppearancePrefs>(() => {
    if (!rawStored) return defaults;
    try {
      const parsed = JSON.parse(rawStored) as Partial<AppearancePrefs>;
      return { ...defaults, ...parsed };
    } catch {
      return defaults;
    }
  }, [rawStored]);

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
      let currentStored: Partial<AppearancePrefs> = {};
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) currentStored = JSON.parse(raw) as Partial<AppearancePrefs>;
      } catch {
        // ignore
      }
      const merged: AppearancePrefs = { ...defaults, ...currentStored, ...normalized };
      saveStored(merged);
      applyTheme(merged.theme);
      applyDensity(merged.density);
    },
    [normalizePrefs],
  );

  const togglePrivacyMode = useCallback(() => {
    apply({ privacyMode: !prefs.privacyMode });
  }, [apply, prefs.privacyMode]);

  useEffect(() => {
    // Clean up pre-hydration CSS blur attribute so React's masked placeholders (••••••) display crisply
    document.documentElement.removeAttribute("data-privacy");
  }, []);

  useEffect(() => {
    applyTheme(prefs.theme);
    applyDensity(prefs.density);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let current: Partial<AppearancePrefs> = {};
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) current = JSON.parse(raw) as Partial<AppearancePrefs>;
      } catch {
        // ignore
      }
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
