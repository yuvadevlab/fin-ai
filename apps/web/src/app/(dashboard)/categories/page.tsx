import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { CategoriesPage } from "@/features/categories/components";
import { prefetchCategories } from "@/features/categories/api/getCategories";
import { getServerAuth } from "@/lib/server-auth";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    await prefetchCategories(queryClient, auth.workspaceId, auth.token);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoriesPage />
    </HydrationBoundary>
  );
}
