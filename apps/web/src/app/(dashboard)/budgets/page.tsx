import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { BudgetsPage } from "@/features/budgets/components";
import { Budget } from "@/features/budgets/api/getBudgets";
import { getServerAuth } from "@/lib/server-auth";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    try {
      await queryClient.prefetchQuery({
        queryKey: ["budgets", auth.workspaceId],
        queryFn: () => serverFetch<Budget[]>(`workspaces/${auth.workspaceId}/budgets`, auth.token),
      });
    } catch (err) {
      console.error("Server-side prefetch error:", err);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BudgetsPage />
    </HydrationBoundary>
  );
}
