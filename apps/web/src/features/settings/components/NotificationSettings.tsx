"use client";

import React from "react";
import { Label, Switch, toast } from "@finai/ui";
import { useProfile, useUpdateProfile } from "../api/profile";

const defaultSettings = [
  { key: "billDueReminders", label: "Bill due reminders" },
  { key: "budgetAlerts", label: "Budget hit 80%" },
  { key: "aiInsights", label: "New AI insight" },
  { key: "largeTransactions", label: "Large transaction (> ₹10k)" },
  { key: "weeklySummary", label: "Weekly summary" },
];

export function NotificationSettings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const notifications = profile?.preferences?.notifications || {};

  const handleToggle = async (key: string, value: boolean) => {
    const updatedPrefs = {
      ...profile?.preferences,
      notifications: {
        ...notifications,
        [key]: value,
      },
    };

    try {
      await updateProfile.mutateAsync({ preferences: updatedPrefs });
      toast.success("Notification settings updated successfully!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to update settings");
    }
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">Loading settings...</div>
    );
  }

  return (
    <div className="space-y-3">
      {defaultSettings.map((item) => {
        const isChecked = notifications[item.key] !== false; // Default to true if not set
        return (
          <div
            key={item.key}
            className="border-border flex items-center justify-between rounded-lg border p-3"
          >
            <Label htmlFor={item.key} className="cursor-pointer text-sm">
              {item.label}
            </Label>
            <Switch
              id={item.key}
              checked={isChecked}
              onCheckedChange={(checked) => handleToggle(item.key, checked)}
              disabled={updateProfile.isPending}
            />
          </div>
        );
      })}
    </div>
  );
}
