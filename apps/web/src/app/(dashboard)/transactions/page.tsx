import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { TransactionsPage } from "@/features/transactions/components";
import { prefetchTransactions } from "@/features/transactions/api/getTransactions";
import { getServerAuth } from "@/lib/server-auth";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await prefetchTransactions(queryClient, auth.workspaceId, auth.token);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionsPage />
    </HydrationBoundary>
  );
}
