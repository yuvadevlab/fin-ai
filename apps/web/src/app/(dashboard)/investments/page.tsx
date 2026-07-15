import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { InvestmentsPage } from "@/features/investments/components";
import { Investment } from "@/features/investments/api/getInvestments";
import { getServerAuth } from "@/lib/server-auth";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    try {
      await queryClient.prefetchQuery({
        queryKey: ["investments", auth.workspaceId],
        queryFn: () =>
          serverFetch<Investment[]>(`workspaces/${auth.workspaceId}/investments`, auth.token),
      });
    } catch (err) {
      console.error("Server-side prefetch error:", err);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InvestmentsPage />
    </HydrationBoundary>
  );
}
