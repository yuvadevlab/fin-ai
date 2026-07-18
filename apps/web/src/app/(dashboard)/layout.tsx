import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/features/dashboard/components";
import { WorkspaceProvider } from "@/providers";
import { getServerAuth } from "@/lib/server-auth";
import { serverFetch } from "@/lib/server-fetch";
import { MenuItem } from "@/features/dashboard/api/getMenuItems";

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

  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ["menu-items"],
      queryFn: () => serverFetch<MenuItem[]>("menu-items", auth.token),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Server-side menu prefetch error:", err);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkspaceProvider initialWorkspaceId={auth.workspaceId}>
        <DashboardShell>{children}</DashboardShell>
      </WorkspaceProvider>
    </HydrationBoundary>
  );
}
