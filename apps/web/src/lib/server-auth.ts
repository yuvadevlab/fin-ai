import { cookies } from "next/headers";

export interface ServerAuth {
  token: string;
  workspaceId: string;
}

/**
 * Reads the auth token and active workspace ID from request cookies.
 * Returns null when either cookie is missing (unauthenticated request).
 */
export async function getServerAuth(): Promise<ServerAuth | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("finai_token")?.value;
  const workspaceId = cookieStore.get("finai_workspace_id")?.value;

  if (!token || !workspaceId) return null;
  return { token, workspaceId };
}
