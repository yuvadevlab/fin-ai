"use client";

import React from "react";
import { User, Users, Bell, Tag, Wallet, Shield, Palette, KeyRound } from "lucide-react";
import { PageContainer, PageHeader, ContentCard } from "@finai/ui";
import { cn } from "@/lib/utils";

const sections = [
  {
    icon: User,
    label: "Profile",
    desc: "Your name, email, and personal details.",
  },
  {
    icon: Users,
    label: "Workspace Management",
    desc: "Create and switch between family workspaces.",
  },
  {
    icon: KeyRound,
    label: "Members",
    desc: "Invite family members and manage roles.",
  },
  {
    icon: Bell,
    label: "Notifications",
    desc: "Choose alerts for bills, budgets, and insights.",
  },
  {
    icon: Tag,
    label: "Categories",
    desc: "Customise categories for personal and shared spending.",
  },
  {
    icon: Wallet,
    label: "Accounts",
    desc: "Manage linked bank accounts and wallets.",
  },
  {
    icon: Shield,
    label: "Security",
    desc: "Two-factor auth, sessions, and export access.",
  },
  {
    icon: Palette,
    label: "Appearance",
    desc: "Theme, density, and dashboard preferences.",
  },
];

export default function SettingsPage() {
  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        title="Settings"
        description="Preferences for your account, family workspaces, and integrations."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <a
            key={s.label}
            href="#"
            onClick={(e) => e.preventDefault()}
            className={cn(
              "group bg-card ring-border/50 hover:ring-primary/20 focus-visible:ring-ring flex items-start gap-4 rounded-2xl p-5 shadow-sm ring-1 transition outline-none hover:shadow-md",
            )}
          >
            <div className="bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors">
              <s.icon className="size-5" />
            </div>
            <div>
              <p className="text-foreground font-bold">{s.label}</p>
              <p className="text-muted-foreground mt-1 text-sm">{s.desc}</p>
            </div>
            <span className="text-muted-foreground ml-auto font-bold transition group-hover:translate-x-0.5">
              →
            </span>
          </a>
        ))}
      </section>
    </PageContainer>
  );
}
