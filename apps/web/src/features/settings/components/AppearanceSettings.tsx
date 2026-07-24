"use client";

import React from "react";
import { FormDialogField, toast } from "@finai/ui";
import { useProfile, useUpdateProfile } from "../api/profile";
import { useAppearance } from "@/hooks/useAppearance";
import type { AppearancePrefs } from "@/providers/appearance/AppearanceProvider";

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
];

export function AppearanceSettings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { apply } = useAppearance();

  const appearance = profile?.preferences?.appearance || {};

  const handleChange = async (key: keyof AppearancePrefs, value: string) => {
    // Apply immediately to DOM
    apply({ [key]: value } as Partial<AppearancePrefs>);

    const updatedPrefs = {
      ...profile?.preferences,
      appearance: {
        ...appearance,
        [key]: value,
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
    <div className="space-y-4">
      {appearanceOptions.map((item) => {
        const value = appearance[item.key] || item.options[0];
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
  );
}
