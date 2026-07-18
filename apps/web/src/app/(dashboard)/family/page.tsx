import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { FamilyPage } from "@/features/family/components";
import { DashboardStats } from "@/features/dashboard/api/getDashboardStats";
import { MonthlyCashFlow } from "@/features/dashboard/api/getMonthlyAnalytics";
import { CategoryBreakdownItem } from "@/features/dashboard/api/getCategoryBreakdown";
import { SavingsTrendPoint } from "@/features/dashboard/api/getSavingsTrend";
import { getServerAuth } from "@/lib/server-auth";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ["analytics", "dashboard", auth.workspaceId],
        queryFn: () =>
          serverFetch<DashboardStats>(
            `workspaces/${auth.workspaceId}/analytics/dashboard`,
            auth.token,
          ),
      }),
      queryClient.prefetchQuery({
        queryKey: ["analytics", "monthly", auth.workspaceId, 6],
        queryFn: () =>
          serverFetch<MonthlyCashFlow[]>(
            `workspaces/${auth.workspaceId}/analytics/monthly?months=6`,
            auth.token,
          ),
      }),
      queryClient.prefetchQuery({
        queryKey: ["analytics", "categories", auth.workspaceId],
        queryFn: () =>
          serverFetch<CategoryBreakdownItem[]>(
            `workspaces/${auth.workspaceId}/analytics/categories`,
            auth.token,
          ),
      }),
      queryClient.prefetchQuery({
        queryKey: ["analytics", "savings-trend", auth.workspaceId, 6],
        queryFn: () =>
          serverFetch<SavingsTrendPoint[]>(
            `workspaces/${auth.workspaceId}/analytics/savings-trend?months=6`,
            auth.token,
          ),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FamilyPage />
    </HydrationBoundary>
  );
}
