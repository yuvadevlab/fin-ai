"use client";

import React, { useState } from "react";
import { FormDialogField, Button, toast } from "@finai/ui";
import { useProfile, useUpdateProfile, type UserProfile } from "../api";

export function ProfileSettings() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return <div className="text-muted-foreground py-4 text-center text-sm">Loading profile...</div>;
  }

  return <ProfileForm profile={profile} />;
}

function ProfileForm({ profile }: { profile: UserProfile }) {
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      await toast
        .promise(updateProfile.mutateAsync({ name, email }), {
          loading: "Saving profile...",
          success: "Profile updated successfully!",
          error: (error: Error) => error.message || "Failed to update profile",
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
          label: "Full name",
          placeholder: "e.g. Aditya Sharma",
        }}
        value={name}
        onChange={(n, v) => setName(v)}
      />

      <FormDialogField
        field={{
          type: "text",
          name: "email",
          label: "Email",
          placeholder: "name@example.com",
        }}
        value={email}
        onChange={(n, v) => setEmail(v)}
      />

      <FormDialogField
        field={{
          type: "text",
          name: "currency",
          label: "Currency",
          disabled: true,
        }}
        value="INR (₹)"
        onChange={() => {}}
      />

      <Button
        className="mt-4 w-full cursor-pointer"
        onClick={handleSave}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
