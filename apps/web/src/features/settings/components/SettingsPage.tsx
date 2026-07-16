"use client";

import { useState, type ReactNode } from "react";
import {
  User,
  Users,
  Bell,
  Tag,
  Wallet,
  Shield,
  Palette,
  KeyRound,
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
  Input,
  Label,
  Switch,
  Badge,
  cn,
  toast,
} from "@finai/ui";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";

type Section = { id: string; icon: LucideIcon; label: string; desc: string; body: ReactNode };

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

function getStoredUser(): { name?: string; email?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("finai_user");
    if (!raw) return {};
    return JSON.parse(raw) as { name?: string; email?: string };
  } catch {
    return {};
  }
}

export function SettingsPage() {
  const [active, setActive] = useState<Section | null>(null);
  const { workspaces, activeWorkspace } = useActiveWorkspace();
  const user = getStoredUser();

  const sections: Section[] = [
    {
      id: "profile",
      icon: User,
      label: "Profile",
      desc: "Your name, email, and personal details.",
      body: (
        <div className="space-y-4">
          <Field label="Full name" defaultValue={user.name ?? "Aditya Sharma"} />
          <Field label="Email" defaultValue={user.email ?? "aditya@sharma.family"} type="email" />
          <Field label="Phone" defaultValue="+91 98765 43210" />
          <Field label="Currency" defaultValue="INR (₹)" />
        </div>
      ),
    },
    {
      id: "workspace",
      icon: Users,
      label: "Workspace Management",
      desc: "Create and switch between family workspaces.",
      body: (
        <ul className="space-y-3">
          {(workspaces ?? []).map((w) => (
            <li
              key={w.id}
              className="border-border flex items-center justify-between rounded-xl border p-4"
            >
              <div>
                <p className="text-sm font-semibold">{w.name}</p>
                <p className="text-muted-foreground text-xs">
                  {w.type === "PERSONAL" ? "Just you" : "Family"} · {w.members?.length ?? 1} member
                  {(w.members?.length ?? 1) > 1 ? "s" : ""}
                </p>
              </div>
              {activeWorkspace?.id === w.id ? <Badge variant="secondary">Active</Badge> : null}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "members",
      icon: KeyRound,
      label: "Members",
      desc: "Invite family members and manage roles.",
      body: (
        <div className="space-y-4">
          <ul className="space-y-2">
            {[
              { name: "Aditya Sharma", role: "Owner" },
              { name: "Riya Sharma", role: "Admin" },
              { name: "Papa Sharma", role: "Viewer" },
              { name: "Anaya Sharma", role: "Viewer" },
            ].map((m) => (
              <li
                key={m.name}
                className="border-border flex items-center justify-between rounded-lg border p-3"
              >
                <p className="text-sm font-medium">{m.name}</p>
                <span className="text-muted-foreground text-xs">{m.role}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input placeholder="name@family.com" />
            <Button onClick={() => toast.success("Invite sent")}>Invite</Button>
          </div>
        </div>
      ),
    },
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      desc: "Choose alerts for bills, budgets, and insights.",
      body: (
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
      ),
    },
    {
      id: "categories",
      icon: Tag,
      label: "Categories",
      desc: "Customise categories for personal and shared spending.",
      body: (
        <div className="flex flex-wrap gap-2">
          {[
            "Food & Dining",
            "Groceries",
            "Transport",
            "Utilities",
            "Shopping",
            "Entertainment",
            "Housing",
            "Travel",
            "Health",
            "Education",
            "Gifts",
            "Investment",
          ].map((c) => (
            <Badge key={c} variant="secondary" className="rounded-full px-3 py-1 text-xs">
              {c}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "accounts",
      icon: Wallet,
      label: "Accounts",
      desc: "Manage linked bank accounts and wallets.",
      body: (
        <ul className="space-y-2">
          {["HDFC Salary", "ICICI Savings", "Joint Account", "HDFC Credit", "Paytm Wallet"].map(
            (a) => (
              <li
                key={a}
                className="border-border flex items-center justify-between rounded-lg border p-3"
              >
                <p className="text-sm font-medium">{a}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() => toast(`${a} refreshing…`)}
                >
                  Sync
                </Button>
              </li>
            ),
          )}
        </ul>
      ),
    },
    {
      id: "security",
      icon: Shield,
      label: "Security",
      desc: "Two-factor auth, sessions, and export access.",
      body: (
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
            onClick={() => toast("Signed out of 3 sessions")}
          >
            Sign out of all other sessions
          </Button>
        </div>
      ),
    },
    {
      id: "appearance",
      icon: Palette,
      label: "Appearance",
      desc: "Theme, density, and dashboard preferences.",
      body: (
        <div className="space-y-3">
          {[
            { l: "Theme", v: "System" },
            { l: "Density", v: "Comfortable" },
            { l: "Default landing tab", v: "My Finance" },
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
      ),
    },
  ];

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
                <Button variant="ghost" className="cursor-pointer" onClick={() => setActive(null)}>
                  Close
                </Button>
                <Button
                  className="cursor-pointer"
                  onClick={() => {
                    toast.success(`${active.label} saved`);
                    setActive(null);
                  }}
                >
                  Save changes
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
