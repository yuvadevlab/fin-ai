import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { BudgetsPage } from "@/features/budgets/components";
import { prefetchBudgets } from "@/features/budgets/api/getBudgets";
import { getServerAuth } from "@/lib/server-auth";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await prefetchBudgets(queryClient, auth.workspaceId, auth.token);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BudgetsPage />
    </HydrationBoundary>
  );
}
