"use client";

import React from "react";
import { FormDialogField, toast } from "@finai/ui";
import { useAppearance } from "@/hooks";
import type { AppearancePrefs } from "@/providers/appearance/AppearanceProvider";
import { useProfile, useUpdateProfile } from "../api";
import { UI_COPY } from "@/lib/ui-copy";

const appearanceOptions: { key: keyof AppearancePrefs; label: string; options: string[] }[] = [
  {
    key: "theme",
    label: UI_COPY.SETTINGS.APPEARANCE.THEME,
    options: [
      UI_COPY.SETTINGS.APPEARANCE.SYSTEM,
      UI_COPY.SETTINGS.APPEARANCE.LIGHT,
      UI_COPY.SETTINGS.APPEARANCE.DARK,
    ],
  },
  {
    key: "density",
    label: UI_COPY.SETTINGS.APPEARANCE.DENSITY,
    options: [UI_COPY.SETTINGS.APPEARANCE.COMFORTABLE, UI_COPY.SETTINGS.APPEARANCE.COMPACT],
  },
  {
    key: "privacyMode",
    label: UI_COPY.SETTINGS.APPEARANCE.PRIVACY_MODE,
    options: [UI_COPY.SETTINGS.APPEARANCE.YES, UI_COPY.SETTINGS.APPEARANCE.NO],
  },
];

export function AppearanceSettings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { prefs, apply } = useAppearance();

  const appearance = profile?.preferences?.appearance || {};

  const handleChange = async (key: keyof AppearancePrefs, value: string) => {
    const parsedValue = key === "privacyMode" ? value === "Yes" : value;

    // Apply immediately to local state & DOM
    apply({ [key]: parsedValue } as Partial<AppearancePrefs>);

    const updatedPrefs = {
      ...profile?.preferences,
      appearance: {
        ...appearance,
        [key]: parsedValue,
      },
    };

    try {
      await toast
        .promise(updateProfile.mutateAsync({ preferences: updatedPrefs }), {
          loading: "Saving appearance...",
          success: "Appearance updated!",
          error: (error: Error) => error.message || "Failed to update appearance",
        })
        .unwrap();
    } catch {
      // Error toast is shown by toast.promise
    }
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">
        {UI_COPY.SETTINGS.LOADING_SETTINGS}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {appearanceOptions.map((item) => {
          let value: string;
          if (item.key === "privacyMode") {
            value = prefs.privacyMode
              ? UI_COPY.SETTINGS.APPEARANCE.YES
              : UI_COPY.SETTINGS.APPEARANCE.NO;
          } else {
            value =
              (prefs[item.key] as string) || (appearance[item.key] as string) || item.options[0];
          }

          return (
            <FormDialogField
              key={item.key}
              field={{
                type: "select",
                name: item.key,
                label: item.label,
                options: item.options.map((opt) => ({ label: opt, value: opt })),
              }}
              value={value}
              onChange={(_name, val) => handleChange(item.key, val)}
            />
          );
        })}
      </div>
    </div>
  );
}
