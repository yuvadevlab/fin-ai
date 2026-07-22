"use client";

import React from "react";
import { Label, toast } from "@finai/ui";
import { useProfile, useUpdateProfile } from "../api/profile";

const appearanceOptions = [
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
    key: "defaultLandingTab",
    label: "Default landing tab",
    options: ["My Finance", "Family Finance"],
  },
  {
    key: "numberFormat",
    label: "Number format",
    options: ["Indian (1,00,000)", "International (100,000)"],
  },
];

export function AppearanceSettings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const appearance = profile?.preferences?.appearance || {};

  const handleChange = async (key: string, value: string) => {
    const updatedPrefs = {
      ...profile?.preferences,
      appearance: {
        ...appearance,
        [key]: value,
      },
    };

    try {
      await updateProfile.mutateAsync({ preferences: updatedPrefs });
      toast.success("Appearance setting updated successfully!");
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
          <div key={item.key} className="border-border flex flex-col gap-2 rounded-lg border p-3">
            <Label htmlFor={item.key} className="text-sm font-semibold">
              {item.label}
            </Label>
            <select
              id={item.key}
              value={value}
              onChange={(e) => handleChange(item.key, e.target.value)}
              disabled={updateProfile.isPending}
              className="bg-background border-border text-foreground focus:ring-primary w-full rounded-lg border p-2 text-sm focus:ring-1 focus:outline-none"
            >
              {item.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
