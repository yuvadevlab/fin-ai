import { DashboardShell } from "@/features/dashboard/components";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const workspace = "Yuva Family";
  const avatarFallback = workspace.substring(0, 2).toUpperCase();

  return (
    <DashboardShell workspaceName={workspace} avatarFallback={avatarFallback}>
      {children}
    </DashboardShell>
  );
}
