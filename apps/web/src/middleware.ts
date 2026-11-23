/**
 * @file apps/web/src/middleware.ts
 * @description Authentication edge middleware enforcing session checks and DevLab SSO redirect.
 * @module @fin-ai/web/middleware
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { StorageKey, AuthQueryParamKey, AuthPrompt, AuthErrorCode } from "@fin-ai/shared-types";
import { DEVLAB_PORTAL_ROUTES } from "@/lib/routes";
import { isJwtExpired } from "@/lib/jwt";

/**
 * Canonical public marketing routes accessible to anonymous visitors and search engines.
 */
const PUBLIC_MARKETING_ROUTES = new Set([
  "/",
  "/features",
  "/expense-tracking",
  "/budget-planning",
  "/ai-financial-advisor",
  "/wealth-management",
  "/financial-goals",
  "/about",
  "/blog",
  "/privacy-policy",
  "/terms-of-service",
]);

function isPublicMarketingRoute(pathname: string): boolean {
  if (PUBLIC_MARKETING_ROUTES.has(pathname)) return true;
  if (pathname.startsWith("/blog/")) return true;
  if (pathname.startsWith("/features/")) return true;
  return false;
}

/**
 * Authentication middleware running before route execution.
 * Checks for authentication token cookies and redirects unauthenticated users
 * attempting to access private application routes directly to the DevLab Portal.
 * Never blocks or redirects anonymous visitors from public marketing pages.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public dynamic metadata assets to pass through without authentication
  const isPublicAsset =
    pathname === "/opengraph-image" ||
    pathname.startsWith("/opengraph-image") ||
    pathname === "/apple-icon" ||
    pathname.startsWith("/apple-icon") ||
    pathname === "/icon.svg" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // 1. If returning from DevLab Portal SSO with token in query params
  const tokenParam =
    request.nextUrl.searchParams.get(AuthQueryParamKey.TOKEN) ||
    request.nextUrl.searchParams.get(AuthQueryParamKey.ACCESS_TOKEN);

  if (tokenParam && tokenParam.trim().length > 0) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete(AuthQueryParamKey.TOKEN);
    cleanUrl.searchParams.delete(AuthQueryParamKey.ACCESS_TOKEN);

    // If the incoming token is already expired, reject immediately and force re-auth
    if (isJwtExpired(tokenParam)) {
      return NextResponse.redirect(
        DEVLAB_PORTAL_ROUTES.LOGIN({
          redirectUrl: cleanUrl.toString(),
          error: AuthErrorCode.SESSION_EXPIRED,
          prompt: AuthPrompt.LOGIN,
        }),
      );
    }

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(StorageKey.TOKEN, tokenParam, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });
    response.cookies.set(StorageKey.DEVLAB_ACCESS_TOKEN, tokenParam, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });
    return response;
  }

  // 2. Validate token from cookies
  const token =
    request.cookies.get(StorageKey.TOKEN)?.value ||
    request.cookies.get(StorageKey.DEVLAB_ACCESS_TOKEN)?.value;

  const isAuthenticated = Boolean(token && !isJwtExpired(token));

  // 3. Allow anonymous visitors and search crawlers full access to public marketing routes
  if (isPublicMarketingRoute(pathname)) {
    return NextResponse.next();
  }

  // 4. Protected application routes require valid authentication
  if (!isAuthenticated) {
    const response = NextResponse.redirect(
      DEVLAB_PORTAL_ROUTES.LOGIN({
        redirectUrl: request.url,
        error: token ? AuthErrorCode.SESSION_EXPIRED : undefined,
        prompt: token ? AuthPrompt.LOGIN : undefined,
      }),
    );
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    if (token) {
      response.cookies.delete(StorageKey.TOKEN);
      response.cookies.delete(StorageKey.DEVLAB_ACCESS_TOKEN);
    }
    return response;
  }

  // Enforce noindex headers on private application dashboard routes
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - opengraph-image, apple-icon, icon.svg, manifest, robots
     * - auth routes (login, register, forgot-password, reset-password)
     * - static asset files (containing a dot: .png, .jpg, .svg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|apple-icon|icon\\.svg|manifest\\.webmanifest|robots\\.txt|login|register|forgot-password|reset-password|.*\\..*).*)",
  ],
};
