"use client";

import React, { useState, type ReactNode } from "react";
import {
  User,
  Users,
  Bell,
  Tag,
  Wallet,
  Shield,
  Palette,
  KeyRound,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  Button,
  cn,
} from "@finai/ui";
import { useActiveWorkspace } from "@/hooks";
import { useCategories } from "@/features/categories";
import { SETTING_FLAGS } from "@/lib/app-constants";
import { WorkspaceMigrationSettings } from "./WorkspaceMigrationSettings";
import { ProfileSettings } from "./ProfileSettings";
import { WorkspaceManagement } from "./WorkspaceManagement";
import { WorkspaceMembers } from "./WorkspaceMembers";
import { NotificationSettings } from "./NotificationSettings";
import { AccountSettingsList } from "./AccountSettingsList";
import { SecuritySettings } from "./SecuritySettings";
import { AppearanceSettings } from "./AppearanceSettings";
import { CategorySettingsList } from "./CategorySettingsList";

type Section = { id: string; icon: LucideIcon; label: string; desc: string; body: ReactNode };

export function SettingsPage() {
  const [active, setActive] = useState<Section | null>(null);
  const { workspaces, activeWorkspace } = useActiveWorkspace();
  const { data: categories = [] } = useCategories(activeWorkspace?.id || null);

  const sections: Section[] = [
    {
      id: "profile",
      icon: User,
      label: "Profile",
      desc: "Your name, email, and personal details.",
      body: <ProfileSettings />,
    },
    {
      id: "workspace",
      icon: Users,
      label: "Workspace Management",
      desc: "Create and switch between family workspaces.",
      body: <WorkspaceManagement workspaces={workspaces || []} activeWorkspace={activeWorkspace} />,
    },
    {
      id: "members",
      icon: KeyRound,
      label: "Members",
      desc: "Invite family members and manage roles.",
      body: <WorkspaceMembers />,
    },
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      desc: "Choose alerts for bills, budgets, and insights.",
      body: <NotificationSettings />,
    },
    {
      id: "categories",
      icon: Tag,
      label: "Categories",
      desc: "Customise categories for personal and shared spending.",
      body: <CategorySettingsList categories={categories} />,
    },
    {
      id: "accounts",
      icon: Wallet,
      label: "Accounts",
      desc: "Manage linked bank accounts and wallets.",
      body: <AccountSettingsList />,
    },
    {
      id: "security",
      icon: Shield,
      label: "Security",
      desc: "Two-factor auth, sessions, and export access.",
      body: <SecuritySettings />,
    },
    {
      id: "appearance",
      icon: Palette,
      label: "Appearance",
      desc: "Theme, density, and dashboard preferences.",
      body: <AppearanceSettings />,
    },
    {
      id: "migration",
      icon: ArrowLeftRight,
      label: "Workspace Migration",
      desc: "Migrate or duplicate accounts and custom categories to other workspaces.",
      body: <WorkspaceMigrationSettings />,
    },
  ].filter((s) => {
    switch (s.id) {
      case "profile":
        return SETTING_FLAGS.PROFILE;
      case "workspace":
        return SETTING_FLAGS.WORKSPACE;
      case "members":
        return SETTING_FLAGS.MEMBERS;
      case "notifications":
        return SETTING_FLAGS.NOTIFICATIONS;
      case "categories":
        return SETTING_FLAGS.CATEGORIES;
      case "accounts":
        return SETTING_FLAGS.ACCOUNTS;
      case "security":
        return SETTING_FLAGS.SECURITY;
      case "appearance":
        return SETTING_FLAGS.APPEARANCE;
      case "migration":
        return SETTING_FLAGS.MIGRATION;
      default:
        return true;
    }
  });

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        title="Settings"
        description="Preferences for your account, family workspaces, and integrations."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s)}
            className={cn(
              "group bg-card ring-border/50 hover:ring-primary/20 focus-visible:ring-ring flex cursor-pointer items-start gap-4 rounded-2xl p-5 text-left shadow-sm ring-1 transition outline-none hover:shadow-md",
            )}
          >
            <div className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
              <s.icon className="size-5" />
            </div>
            <div>
              <p className="font-semibold">{s.label}</p>
              <p className="text-muted-foreground mt-1 text-sm">{s.desc}</p>
            </div>
            <span className="text-muted-foreground ml-auto transition group-hover:translate-x-0.5">
              →
            </span>
          </button>
        ))}
      </section>

      <Sheet open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {active ? (
            <>
              <SheetHeader>
                <SheetTitle>{active.label}</SheetTitle>
                <SheetDescription>{active.desc}</SheetDescription>
              </SheetHeader>
              <div className="mt-6">{active.body}</div>
              <SheetFooter className="mt-6">
                <Button
                  variant="ghost"
                  className="w-full cursor-pointer"
                  onClick={() => setActive(null)}
                >
                  Close
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
