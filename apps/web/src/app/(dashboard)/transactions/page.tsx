import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { TransactionsPage } from "@/features/transactions/components";
import { PaginatedTransactions } from "@/features/transactions/api/getTransactions";
import { getServerAuth } from "@/lib/server-auth";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    try {
      await queryClient.prefetchQuery({
        queryKey: ["transactions", auth.workspaceId, {}],
        queryFn: () =>
          serverFetch<PaginatedTransactions>(
            `workspaces/${auth.workspaceId}/transactions`,
            auth.token,
          ),
      });
    } catch (err) {
      console.error("Server-side prefetch error:", err);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionsPage />
    </HydrationBoundary>
  );
}
