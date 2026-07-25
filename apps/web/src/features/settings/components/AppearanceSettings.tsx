"use client";

import React from "react";
import { FormDialogField, toast } from "@finai/ui";
import { useProfile, useUpdateProfile } from "../api/profile";
import { useAppearance } from "@/hooks/useAppearance";
import type { AppearancePrefs } from "@/providers/appearance/AppearanceProvider";
import { CyclePeriod } from "@finai/shared-types";

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

  const cycleStartDay = String(profile?.preferences?.cycleStartDay || 1);
  const cyclePeriod = profile?.preferences?.cyclePeriod || "MONTHLY";

  const handleCycleStartDayChange = async (val: string) => {
    const dayNum = parseInt(val, 10) || 1;
    const updatedPrefs = {
      ...profile?.preferences,
      cycleStartDay: dayNum,
    };
    try {
      await updateProfile.mutateAsync({ preferences: updatedPrefs });
      toast.success(`Default cycle start day updated to Day ${dayNum}!`);
    } catch (err) {
      toast.error((err as Error).message || "Failed to update cycle start day");
    }
  };

  const handleCyclePeriodChange = async (val: string) => {
    const updatedPrefs = {
      ...profile?.preferences,
      cyclePeriod: val as CyclePeriod,
    };
    try {
      await updateProfile.mutateAsync({ preferences: updatedPrefs });
      toast.success("Default cycle period updated!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to update cycle period");
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

      <div className="border-border/60 space-y-4 border-t pt-4">
        <div>
          <h4 className="text-foreground text-sm font-semibold">
            Default Data & Accounting Cycle Preference
          </h4>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Configure how your default date range is calculated across dashboards, transactions, and
            reports.
          </p>
        </div>

        <FormDialogField
          field={{
            type: "select",
            name: "cycleStartDay",
            label: "Default Cycle Start Day",
            options: Array.from({ length: 31 }, (_, i) => ({
              label: i === 0 ? `Day 1 (Default - Month Start)` : `Day ${i + 1} of month`,
              value: String(i + 1),
            })),
          }}
          value={cycleStartDay}
          onChange={(_name, val) => handleCycleStartDayChange(val)}
        />

        <FormDialogField
          field={{
            type: "select",
            name: "cyclePeriod",
            label: "Default Accounting Period",
            options: [
              { label: "Monthly (Default)", value: "MONTHLY" },
              { label: "Weekly", value: "WEEKLY" },
              { label: "Quarterly", value: "QUARTERLY" },
              { label: "Yearly", value: "YEARLY" },
            ],
          }}
          value={cyclePeriod}
          onChange={(_name, val) => handleCyclePeriodChange(val)}
        />
      </div>
    </div>
  );
}
