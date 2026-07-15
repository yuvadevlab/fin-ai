import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { GoalsPage } from "@/features/goals/components";
import { Goal } from "@/features/goals/api/getGoals";
import { getServerAuth } from "@/lib/server-auth";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    try {
      await queryClient.prefetchQuery({
        queryKey: ["goals", auth.workspaceId],
        queryFn: () => serverFetch<Goal[]>(`workspaces/${auth.workspaceId}/goals`, auth.token),
      });
    } catch (err) {
      console.error("Server-side prefetch error:", err);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GoalsPage />
    </HydrationBoundary>
  );
}
