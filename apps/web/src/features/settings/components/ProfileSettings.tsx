"use client";

import React, { useState } from "react";
import { Input, Label, Button, toast } from "@finai/ui";
import { useProfile, useUpdateProfile, type UserProfile } from "../api/profile";

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
      await updateProfile.mutateAsync({ name, email });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Full name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Email</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Currency</Label>
        <Input value="INR (₹)" disabled className="bg-muted text-muted-foreground" />
      </div>

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
