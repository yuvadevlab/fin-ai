import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { AccountsPage } from "@/features/accounts/components";
import { Account } from "@/features/accounts/api/getAccounts";
import { getServerAuth } from "@/lib/server-auth";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    try {
      await queryClient.prefetchQuery({
        queryKey: ["accounts", auth.workspaceId],
        queryFn: () =>
          serverFetch<Account[]>(`workspaces/${auth.workspaceId}/accounts`, auth.token),
      });
    } catch (err) {
      console.error("Server-side prefetch error:", err);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountsPage />
    </HydrationBoundary>
  );
}
