"use client";

import React, { useState } from "react";
import { FormDialogField, Button, toast } from "@finai/ui";
import { useProfile, useUpdateProfile, type UserProfile } from "../api";
import { UI_COPY } from "@/lib/ui-copy";

export function ProfileSettings() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">
        {UI_COPY.SETTINGS.LOADING_PROFILE}
      </div>
    );
  }

  return <ProfileForm profile={profile} />;
}

function ProfileForm({ profile }: { profile: UserProfile }) {
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(UI_COPY.SETTINGS.NAME_REQUIRED);
      return;
    }
    if (!email.trim()) {
      toast.error(UI_COPY.SETTINGS.EMAIL_REQUIRED);
      return;
    }

    try {
      await toast
        .promise(updateProfile.mutateAsync({ name, email }), {
          loading: UI_COPY.SETTINGS.PROFILE_SAVING,
          success: UI_COPY.SETTINGS.PROFILE_UPDATED,
          error: (error: Error) => error.message || UI_COPY.SETTINGS.PROFILE_UPDATE_FAILED,
        })
        .unwrap();
    } catch {
      // Error toast is shown by toast.promise
    }
  };

  return (
    <div className="space-y-4">
      <FormDialogField
        field={{
          type: "text",
          name: "name",
          label: UI_COPY.SETTINGS.NAME_LABEL,
          placeholder: UI_COPY.SETTINGS.NAME_PLACEHOLDER,
        }}
        value={name}
        onChange={(n, v) => setName(v)}
      />

      <FormDialogField
        field={{
          type: "text",
          name: "email",
          label: UI_COPY.SETTINGS.EMAIL_LABEL,
          placeholder: UI_COPY.SETTINGS.EMAIL_PLACEHOLDER,
        }}
        value={email}
        onChange={(n, v) => setEmail(v)}
      />

      <FormDialogField
        field={{
          type: "text",
          name: "currency",
          label: UI_COPY.SETTINGS.CURRENCY_LABEL,
          disabled: true,
        }}
        value={UI_COPY.SETTINGS.INR_CURRENCY}
        onChange={() => {}}
      />

      <Button
        className="mt-4 w-full cursor-pointer"
        onClick={handleSave}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? UI_COPY.COMMON.ACTIONS.SAVING : UI_COPY.COMMON.ACTIONS.SAVE}
      </Button>
    </div>
  );
}
