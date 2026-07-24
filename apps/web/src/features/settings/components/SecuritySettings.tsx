"use client";

import React from "react";
import { Button, Switch, toast } from "@finai/ui";
import { useProfile, useUpdateProfile } from "../api/profile";

export function SecuritySettings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const security = profile?.preferences?.security || {};

  const handleToggle = async (key: string, value: boolean) => {
    const updatedPrefs = {
      ...profile?.preferences,
      security: {
        ...security,
        [key]: value,
      },
    };

    try {
      await updateProfile.mutateAsync({ preferences: updatedPrefs });
      toast.success("Security setting updated successfully!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to update security setting");
    }
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">Loading settings...</div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border-border flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Two-factor authentication</p>
          <p className="text-muted-foreground text-xs">Adds an extra step at sign-in.</p>
        </div>
        <Switch
          checked={!!security.twoFactor}
          onCheckedChange={(checked) => handleToggle("twoFactor", checked)}
          disabled={updateProfile.isPending}
        />
      </div>
      <div className="border-border flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Biometric unlock</p>
          <p className="text-muted-foreground text-xs">Use Face ID / fingerprint on mobile.</p>
        </div>
        <Switch
          checked={!!security.biometrics}
          onCheckedChange={(checked) => handleToggle("biometrics", checked)}
          disabled={updateProfile.isPending}
        />
      </div>
      <Button
        variant="outline"
        className="w-full cursor-pointer"
        onClick={() => toast.success("Signed out of 3 sessions")}
      >
        Sign out of all other sessions
      </Button>
    </div>
  );
}
