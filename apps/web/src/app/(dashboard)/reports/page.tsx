import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { ReportsPage } from "@/features/reports/components";
import { prefetchDashboardStats } from "@/features/dashboard/api/getDashboardStats";
import { prefetchMonthlyAnalytics } from "@/features/dashboard/api/getMonthlyAnalytics";
import { prefetchCategoryBreakdown } from "@/features/dashboard/api/getCategoryBreakdown";
import { getServerAuth } from "@/lib/server-auth";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await Promise.allSettled([
      prefetchDashboardStats(queryClient, auth.token, auth.workspaceId),
      prefetchMonthlyAnalytics(queryClient, auth.token, 6, auth.workspaceId),
      prefetchCategoryBreakdown(queryClient, auth.token, auth.workspaceId),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReportsPage />
    </HydrationBoundary>
  );
}
