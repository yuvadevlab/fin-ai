import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { HealthPage } from "@/features/health/components";
import { prefetchHealthScore } from "@/features/dashboard/api/getHealthScore";
import { getServerAuth } from "@/lib/server-auth";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await prefetchHealthScore(queryClient, auth.workspaceId, auth.token);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HealthPage />
    </HydrationBoundary>
  );
}
