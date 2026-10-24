"use client";

import React from "react";
import Link from "next/link";
import { APP_ROUTES } from "@/lib";
import { Button, Input, Label, Switch, Badge, toast } from "@finai/ui";
import { type Category } from "@/features/categories";
import { UI_COPY } from "@/lib/ui-copy";

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
      <Field label={UI_COPY.SETTINGS.NAME_LABEL} defaultValue={user?.name ?? ""} />
      <Field label={UI_COPY.SETTINGS.EMAIL_LABEL} defaultValue={user?.email ?? ""} type="email" />
      <Field label={UI_COPY.SETTINGS.CURRENCY_LABEL} defaultValue={UI_COPY.SETTINGS.INR_CURRENCY} />
    </div>
  );
}

// 2. Notification Settings
export function NotificationSettings() {
  return (
    <div className="space-y-3">
      {[...UI_COPY.SETTINGS.NOTIFICATIONS].map((l) => (
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
          <p className="text-sm font-medium">{UI_COPY.SETTINGS.TWO_FACTOR_TITLE}</p>
          <p className="text-muted-foreground text-xs">{UI_COPY.SETTINGS.TWO_FACTOR_DESCRIPTION}</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="border-border flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">{UI_COPY.SETTINGS.BIOMETRIC_TITLE}</p>
          <p className="text-muted-foreground text-xs">{UI_COPY.SETTINGS.BIOMETRIC_DESCRIPTION}</p>
        </div>
        <Switch />
      </div>
      <Button
        variant="outline"
        className="w-full cursor-pointer"
        onClick={() => toast(UI_COPY.SETTINGS.SIGNED_OUT_OTHER_SESSIONS)}
      >
        {UI_COPY.SETTINGS.SIGN_OUT_OTHER_SESSIONS}
      </Button>
    </div>
  );
}

// 4. Appearance Settings
export function AppearanceSettings() {
  return (
    <div className="space-y-3">
      {[
        { l: UI_COPY.SETTINGS.APPEARANCE.THEME, v: UI_COPY.SETTINGS.APPEARANCE.SYSTEM },
        { l: UI_COPY.SETTINGS.APPEARANCE.DENSITY, v: UI_COPY.SETTINGS.APPEARANCE.COMFORTABLE },
        {
          l: UI_COPY.SETTINGS.APPEARANCE.DEFAULT_LANDING_TAB,
          v: UI_COPY.SETTINGS.APPEARANCE.OVERVIEW,
        },
        {
          l: UI_COPY.SETTINGS.APPEARANCE.NUMBER_FORMAT,
          v: UI_COPY.SETTINGS.APPEARANCE.INDIAN_FORMAT,
        },
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
        <Link href={APP_ROUTES.CATEGORIES}>
          <Button size="sm" variant="outline" className="w-full cursor-pointer">
            Manage Categories
          </Button>
        </Link>
      </div>
    </div>
  );
}
