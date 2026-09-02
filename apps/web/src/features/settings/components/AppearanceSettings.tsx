"use client";

import React from "react";
import { FormDialogField, toast } from "@finai/ui";
import { useAppearance } from "@/hooks";
import type { AppearancePrefs } from "@/providers/appearance/AppearanceProvider";
import { useProfile, useUpdateProfile } from "../api";

const appearanceOptions: { key: keyof AppearancePrefs; label: string; options: string[] }[] = [
  {
    key: "theme",
    label: "Theme",
    options: ["System", "Light", "Dark"],
  },
  {
    key: "density",
    label: "Density",
    options: ["Comfortable", "Compact"],
  },
  {
    key: "privacyMode",
    label: "Privacy Mode",
    options: ["Yes", "No"],
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
      await updateProfile.mutateAsync({ preferences: updatedPrefs });
      toast.success("Appearance updated!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to update appearance");
    }
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">Loading settings...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {appearanceOptions.map((item) => {
          let value: string;
          if (item.key === "privacyMode") {
            value = prefs.privacyMode ? "Yes" : "No";
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
