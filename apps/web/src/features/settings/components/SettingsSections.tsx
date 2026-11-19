"use client";

import React from "react";
import Link from "next/link";
import { APP_ROUTES } from "@/lib";
import { Button, Input, Label, Switch, Badge, toast } from "@fin-ai/ui";
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
    <div className="fn-settings-field-group">
      <Label className="fn-settings-field-label">{label}</Label>
      <Input defaultValue={defaultValue} type={type} />
    </div>
  );
}

// 1. Profile Settings
export function ProfileSettings({ user }: { user: { name?: string; email?: string } }) {
  return (
    <div className="fn-settings-form-stack">
      <Field label={UI_COPY.SETTINGS.NAME_LABEL} defaultValue={user?.name ?? ""} />
      <Field label={UI_COPY.SETTINGS.EMAIL_LABEL} defaultValue={user?.email ?? ""} type="email" />
      <Field label={UI_COPY.SETTINGS.CURRENCY_LABEL} defaultValue={UI_COPY.SETTINGS.INR_CURRENCY} />
    </div>
  );
}

// 2. Notification Settings
export function NotificationSettings() {
  return (
    <div className="fn-settings-form-stack">
      {[...UI_COPY.SETTINGS.NOTIFICATIONS].map((l) => (
        <div key={l} className="fn-settings-item-row">
          <Label className="fn-settings-row-label">{l}</Label>
          <Switch defaultChecked />
        </div>
      ))}
    </div>
  );
}

// 3. Security Settings
export function SecuritySettings() {
  return (
    <div className="fn-settings-form-stack">
      <div className="fn-settings-item-row">
        <div>
          <p className="fn-settings-row-title">{UI_COPY.SETTINGS.TWO_FACTOR_TITLE}</p>
          <p className="fn-settings-row-desc">{UI_COPY.SETTINGS.TWO_FACTOR_DESCRIPTION}</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="fn-settings-item-row">
        <div>
          <p className="fn-settings-row-title">{UI_COPY.SETTINGS.BIOMETRIC_TITLE}</p>
          <p className="fn-settings-row-desc">{UI_COPY.SETTINGS.BIOMETRIC_DESCRIPTION}</p>
        </div>
        <Switch />
      </div>
      <Button
        variant="outline"
        className="fn-settings-close-btn"
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
    <div className="fn-settings-form-stack">
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
        <div key={r.l} className="fn-settings-item-row">
          <Label className="fn-settings-row-label">{r.l}</Label>
          <span className="fn-settings-row-val">{r.v}</span>
        </div>
      ))}
    </div>
  );
}

// 5. Category Settings List
export function CategorySettingsList({ categories }: { categories: Category[] }) {
  return (
    <div className="fn-settings-form-stack">
      <div className="fn-settings-categories-wrap">
        {categories.map((c) => (
          <Badge key={c.id} variant="secondary" className="fn-settings-category-pill">
            {c.name}
          </Badge>
        ))}
      </div>
      <div className="fn-settings-manage-btn">
        <Link href={APP_ROUTES.CATEGORIES}>
          <Button size="sm" variant="outline" className="fn-settings-close-btn">
            {UI_COPY.SETTINGS.MANAGE_CATEGORIES}
          </Button>
        </Link>
      </div>
    </div>
  );
}
