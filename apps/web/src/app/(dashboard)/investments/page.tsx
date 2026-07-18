import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { InvestmentsPage } from "@/features/investments/components";
import { prefetchInvestments } from "@/features/investments/api/getInvestments";
import { getServerAuth } from "@/lib/server-auth";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await prefetchInvestments(queryClient, auth.workspaceId, auth.token);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InvestmentsPage />
    </HydrationBoundary>
  );
}
