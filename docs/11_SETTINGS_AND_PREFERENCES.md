# 11 — Settings & System Preferences Specification

This document details the **Settings Page (`/settings`)**, dynamic section rendering driven by environment feature flags, deep-link query parameters, 2-file feature pattern modal standards, and DOM theme/density synchronization.

---

## 1. Product Requirements & Overview

The Settings page provides a unified configuration hub for user profiles, family workspace management, member roles, notification alerts, category customization, linked bank accounts, security preferences, appearance customization, and workspace data migration.

---

## 2. Dynamic Section Filtering & Deep-Linking

### 2.1 Feature Flag Filtering (`SETTING_FLAGS`)

Sections are dynamically rendered based on environment feature flags (`NEXT_PUBLIC_SETTING_*`):

```ts
export const SETTING_FLAGS = {
  PROFILE: process.env.NEXT_PUBLIC_SETTING_PROFILE !== "false",
  WORKSPACE: process.env.NEXT_PUBLIC_SETTING_WORKSPACE !== "false",
  MEMBERS: process.env.NEXT_PUBLIC_SETTING_MEMBERS !== "false",
  NOTIFICATIONS: process.env.NEXT_PUBLIC_SETTING_NOTIFICATIONS !== "false",
  CATEGORIES: process.env.NEXT_PUBLIC_SETTING_CATEGORIES !== "false",
  ACCOUNTS: process.env.NEXT_PUBLIC_SETTING_ACCOUNTS !== "false",
  SECURITY: process.env.NEXT_PUBLIC_SETTING_SECURITY !== "false",
  APPEARANCE: process.env.NEXT_PUBLIC_SETTING_APPEARANCE !== "false",
  MIGRATION: process.env.NEXT_PUBLIC_SETTING_MIGRATION !== "false",
};
```

### 2.2 Section Deep-Linking Query Parameters (`/settings?section=*`)

The `SettingsPage` inspects `searchParams.get("section")` and automatically opens the matching drawer sheet without requiring additional clicks:

```ts
const searchParams = useSearchParams();
const sectionQuery = searchParams.get("section");
const [selectedId, setSelectedId] = useState<string | null>(null);

const active = sections.find((s) => s.id === (selectedId ?? sectionQuery)) || null;
```

---

## 3. 2-File Feature Modal Pattern Standard

All data entry modals in `@finai/web` MUST follow the standardized **2-file feature pattern**:

```text
src/features/<feature-name>/components/
├── <Entity>Form.tsx         # Pure form fields presentation component
└── <Entity>Dialog.tsx       # Modal wrapper, Zod validation, and React Query mutation
```

### Pattern Rules

1. `<Entity>Form.tsx`: Pure presentation component accepting `values`, `errors`, and `onChange` props. Renders fields using `<FormDialogField />` from `@finai/ui`.
2. `<Entity>Dialog.tsx`: Modal wrapper. Validates input inside `handleSubmit` using `schema.safeParse()`. Maps validation errors to field error state, calls React Query mutation, and handles root API error alerts.

---

## 4. Theme & Density Synchronization (`AppearanceProvider.tsx`)

- **Theme Mode**:
  - `Light`: Removes `.dark` class from `<html>`.
  - `Dark`: Adds `.dark` class to `<html>`.
  - `System`: Listens to `window.matchMedia("(prefers-color-scheme: dark)")` and updates dynamically.
- **Density Mode**:
  - `Comfortable`: Standard padding (`p-5`, `p-4`, `space-y-4`).
  - `Compact`: Applies `.density-compact` to `<body>`, scaling down CSS padding variables (`--spacing-scale: 0.75`).
