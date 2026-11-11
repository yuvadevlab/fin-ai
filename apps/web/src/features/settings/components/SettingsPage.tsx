"use client";

import React, { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { User, Palette, Users, type LucideIcon } from "lucide-react";
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
} from "@finai/ui";
import { ProfileSettings } from "./ProfileSettings";
import { AppearanceSettings } from "./AppearanceSettings";
import { WorkspaceSettings } from "@/features/workspaces/components";
import { UI_COPY } from "@/lib/ui-copy";

type Section = { id: string; icon: LucideIcon; label: string; desc: string; body: ReactNode };

export function SettingsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const sectionQuery = searchParams.get("section") || searchParams.get("tab");

  const sections: Section[] = [
    {
      id: "workspaces",
      icon: Users,
      label: UI_COPY.WORKSPACES.TITLE,
      desc: UI_COPY.WORKSPACES.CREATE_DESCRIPTION,
      body: <WorkspaceSettings />,
    },
    {
      id: "profile",
      icon: User,
      label: UI_COPY.SETTINGS.PROFILE,
      desc: UI_COPY.SETTINGS.PROFILE_DESCRIPTION,
      body: <ProfileSettings />,
    },
    {
      id: "appearance",
      icon: Palette,
      label: UI_COPY.SETTINGS.APPEARANCE_LABEL,
      desc: UI_COPY.SETTINGS.APPEARANCE_DESCRIPTION,
      body: <AppearanceSettings />,
    },
  ];

  const active = sections.find((s) => s.id === (selectedId ?? sectionQuery)) || null;

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        title={UI_COPY.SETTINGS.PAGE_TITLE}
        description={UI_COPY.SETTINGS.PAGE_DESCRIPTION}
      />

      <section className="fn-settings-grid">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            className="fn-settings-card group"
          >
            <div className="fn-settings-card-icon">
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

      <Sheet open={!!active} onOpenChange={(open) => !open && setSelectedId("")}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
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
                  onClick={() => setSelectedId("")}
                >
                  {UI_COPY.SETTINGS.CLOSE}
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
