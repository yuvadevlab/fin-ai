import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { AccountsPage } from "@/features/accounts/components";
import { prefetchAccounts } from "@/features/accounts/api/getAccounts";
import { getServerAuth } from "@/lib/server-auth";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await prefetchAccounts(queryClient, auth.workspaceId, auth.token);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountsPage />
    </HydrationBoundary>
  );
}
