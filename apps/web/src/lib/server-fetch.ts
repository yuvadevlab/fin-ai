/**
 * Server-side fetch helper for Next.js RSC (page.tsx) prefetching.
 *
 * - Reads the API base URL from NEXT_PUBLIC_API_URL env var (falls back to localhost).
 * - Attaches the auth Bearer token from cookies.
 * - Unwraps the NestJS TransformInterceptor envelope { success, data } automatically.
 * - Throws on non-OK HTTP responses so React Query can catch the error gracefully.
 */

const SERVER_API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : "http://localhost:3001/api/v1";

export async function serverFetch<T>(endpoint: string, token: string): Promise<T> {
  const url = `${SERVER_API_BASE}/${endpoint.replace(/^\//, "")}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // Opt out of Next.js data cache for SSR prefetching – always fresh
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Server fetch failed [${res.status}] ${url}: ${text.slice(0, 200)}`);
  }

  const json = await res.json();

  // Unwrap NestJS TransformInterceptor envelope: { success: true, data: ... }
  if (json && typeof json === "object" && "success" in json && "data" in json) {
    return json.data as T;
  }

  return json as T;
}
