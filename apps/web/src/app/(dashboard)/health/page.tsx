import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { HealthPage } from "@/features/health/components";
import { HealthScoreData } from "@/features/dashboard/api/getHealthScore";
import { getServerAuth } from "@/lib/server-auth";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await queryClient.prefetchQuery({
      queryKey: ["analytics", "health", auth.workspaceId],
      queryFn: () =>
        serverFetch<HealthScoreData>(`workspaces/${auth.workspaceId}/analytics/health`, auth.token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HealthPage />
    </HydrationBoundary>
  );
}
