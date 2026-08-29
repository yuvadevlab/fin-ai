import { cookies } from "next/headers";

export interface ServerAuth {
  token: string;
}

/**
 * Reads the auth token from request cookies.
 * Returns null when token cookie is missing (unauthenticated request).
 */
export async function getServerAuth(): Promise<ServerAuth | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("finai_token")?.value;

  if (!token) return null;
  return { token };
}
