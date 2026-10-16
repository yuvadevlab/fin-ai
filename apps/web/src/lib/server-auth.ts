import { cookies } from "next/headers";
import { StorageKey } from "@finai/shared-types";

export interface ServerAuth {
  token: string;
}

/**
 * Reads the auth token from request cookies.
 * Supports both finai-native token and DevLab platform access token.
 * Returns null when token cookie is missing (unauthenticated request).
 */
export async function getServerAuth(): Promise<ServerAuth | null> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(StorageKey.TOKEN)?.value ||
    cookieStore.get(StorageKey.DEVLAB_ACCESS_TOKEN)?.value;

  if (!token) return null;
  return { token };
}
