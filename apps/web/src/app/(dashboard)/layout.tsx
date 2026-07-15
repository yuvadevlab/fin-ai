import { redirect } from "next/navigation";
import { DashboardShell } from "@/features/dashboard/components";
import { WorkspaceProvider } from "@/providers";
import { getServerAuth } from "@/lib/server-auth";

/**
 * Dashboard layout — server component.
 *
 * Responsibilities:
 * 1. Auth guard: redirects to /login if no valid token/workspaceId cookie.
 * 2. Provides WorkspaceProvider with the server-known workspaceId so all
 *    child client components start with the same ID as the SSR render,
 *    preventing React hydration mismatches.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerAuth();

  if (!auth) {
    redirect("/login");
  }

  return (
    <WorkspaceProvider initialWorkspaceId={auth.workspaceId}>
      <DashboardShell>{children}</DashboardShell>
    </WorkspaceProvider>
  );
}
