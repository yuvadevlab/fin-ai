import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { GoalsPage } from "@/features/goals/components";
import { prefetchGoals } from "@/features/goals/api/getGoals";
import { getServerAuth } from "@/lib/server-auth";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await prefetchGoals(queryClient, auth.workspaceId, auth.token);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GoalsPage />
    </HydrationBoundary>
  );
}
