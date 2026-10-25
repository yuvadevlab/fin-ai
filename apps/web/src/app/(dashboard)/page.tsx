import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { DashboardPage } from "@/features/dashboard/components";
import { prefetchDashboardStats } from "@/features/dashboard/api/getDashboardStats";
import { prefetchMonthlyAnalytics } from "@/features/dashboard/api/getMonthlyAnalytics";
import { prefetchCategoryBreakdown } from "@/features/dashboard/api/getCategoryBreakdown";
import { prefetchHealthScore } from "@/features/dashboard/api/getHealthScore";
import { prefetchBudgets } from "@/features/budgets/api/getBudgets";
import { prefetchGoals } from "@/features/goals/api/getGoals";
import { prefetchInvestments } from "@/features/investments/api/getInvestments";
import { getServerAuth } from "@/lib/server-auth";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await Promise.allSettled([
      prefetchDashboardStats(queryClient, auth.token, auth.workspaceId),
      prefetchMonthlyAnalytics(queryClient, auth.token, 6, auth.workspaceId),
      prefetchCategoryBreakdown(queryClient, auth.token, auth.workspaceId),
      prefetchHealthScore(queryClient, auth.token, auth.workspaceId),
      prefetchBudgets(queryClient, auth.token, auth.workspaceId),
      prefetchGoals(queryClient, auth.token, auth.workspaceId),
      prefetchInvestments(queryClient, auth.token, auth.workspaceId),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPage />
    </HydrationBoundary>
  );
}
