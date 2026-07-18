import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { CategoriesPage } from "@/features/categories/components";
import { Category } from "@/features/categories/api/getCategories";
import { getServerAuth } from "@/lib/server-auth";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {
  const auth = await getServerAuth();
  const queryClient = new QueryClient();

  if (auth) {
    try {
      await queryClient.prefetchQuery({
        queryKey: ["categories", auth.workspaceId],
        queryFn: () =>
          serverFetch<Category[]>(`workspaces/${auth.workspaceId}/categories`, auth.token),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Server-side prefetch error for categories:", err);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoriesPage />
    </HydrationBoundary>
  );
}
