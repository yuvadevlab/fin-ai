"use client";

import React from "react";
import { Button, Input, Label, Switch, Badge, toast } from "@finai/ui";
import { type Category } from "@/features/categories";

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input defaultValue={defaultValue} type={type} />
    </div>
  );
}

// 1. Profile Settings
export function ProfileSettings({ user }: { user: { name?: string; email?: string } }) {
  return (
    <div className="space-y-4">
      <Field label="Full name" defaultValue={user?.name ?? ""} />
      <Field label="Email" defaultValue={user?.email ?? ""} type="email" />
      <Field label="Currency" defaultValue="INR (₹)" />
    </div>
  );
}

// 2. Notification Settings
export function NotificationSettings() {
  return (
    <div className="space-y-3">
      {[
        "Bill due reminders",
        "Budget hit 80%",
        "New AI insight",
        "Large transaction (> ₹10k)",
        "Weekly summary",
      ].map((l) => (
        <div
          key={l}
          className="border-border flex items-center justify-between rounded-lg border p-3"
        >
          <Label className="text-sm">{l}</Label>
          <Switch defaultChecked />
        </div>
      ))}
    </div>
  );
}

// 3. Security Settings
export function SecuritySettings() {
  return (
    <div className="space-y-3">
      <div className="border-border flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Two-factor authentication</p>
          <p className="text-muted-foreground text-xs">Adds an extra step at sign-in.</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="border-border flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Biometric unlock</p>
          <p className="text-muted-foreground text-xs">Use Face ID / fingerprint on mobile.</p>
        </div>
        <Switch />
      </div>
      <Button
        variant="outline"
        className="w-full cursor-pointer"
        onClick={() => toast("Signed out of other sessions")}
      >
        Sign out of all other sessions
      </Button>
    </div>
  );
}

// 4. Appearance Settings
export function AppearanceSettings() {
  return (
    <div className="space-y-3">
      {[
        { l: "Theme", v: "System" },
        { l: "Density", v: "Comfortable" },
        { l: "Default landing tab", v: "Overview" },
        { l: "Number format", v: "Indian (1,00,000)" },
      ].map((r) => (
        <div
          key={r.l}
          className="border-border flex items-center justify-between rounded-lg border p-3"
        >
          <Label className="text-sm">{r.l}</Label>
          <span className="text-muted-foreground text-xs">{r.v}</span>
        </div>
      ))}
    </div>
  );
}

// 5. Category Settings List
export function CategorySettingsList({ categories }: { categories: Category[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Badge key={c.id} variant="secondary" className="rounded-full px-3 py-1 text-xs">
            {c.name}
          </Badge>
        ))}
      </div>
      <div className="pt-2">
        <a href="/categories">
          <Button size="sm" variant="outline" className="w-full cursor-pointer">
            Manage Categories
          </Button>
        </a>
      </div>
    </div>
  );
}
