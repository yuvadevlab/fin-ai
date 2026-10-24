import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/lib";
import { API_ENDPOINTS, QUERY_KEYS } from "@finai/shared-types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/features/dashboard/components";
import { AuthProvider } from "@/providers";
import { getServerAuth } from "@/lib/server-auth";
import { serverFetch } from "@/lib/server-fetch";
import { MenuItem } from "@/features/dashboard/api/getMenuItems";

/**
 * Dashboard layout — server component.
 *
 * Responsibilities:
 * 1. Auth guard: redirects to /login if no valid token cookie.
 * 2. Wraps the app in AuthProvider and DashboardShell.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerAuth();

  if (!auth) {
    redirect(APP_ROUTES.LOGIN);
  }

  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.MENU_ITEMS.ALL,
      queryFn: () => serverFetch<MenuItem[]>(API_ENDPOINTS.MENU_ITEMS.BASE, auth.token),
    });
  } catch {
    // prefetch fallback
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthProvider initialToken={auth.token}>
        <DashboardShell>{children}</DashboardShell>
      </AuthProvider>
    </HydrationBoundary>
  );
}
