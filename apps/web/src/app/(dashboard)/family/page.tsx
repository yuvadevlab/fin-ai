import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { FamilyPage } from "@/features/family/components";
import { prefetchDashboardStats } from "@/features/dashboard/api/getDashboardStats";
import { prefetchMonthlyAnalytics } from "@/features/dashboard/api/getMonthlyAnalytics";
import { prefetchCategoryBreakdown } from "@/features/dashboard/api/getCategoryBreakdown";
import { prefetchSavingsTrend } from "@/features/dashboard/api/getSavingsTrend";
import { getServerAuth } from "@/lib/server-auth";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await Promise.allSettled([
      prefetchDashboardStats(queryClient, auth.workspaceId, auth.token),
      prefetchMonthlyAnalytics(queryClient, auth.workspaceId, auth.token),
      prefetchCategoryBreakdown(queryClient, auth.workspaceId, auth.token),
      prefetchSavingsTrend(queryClient, auth.workspaceId, auth.token),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FamilyPage />
    </HydrationBoundary>
  );
}
