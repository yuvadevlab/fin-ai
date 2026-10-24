/**
 * @file apps/web/src/middleware.ts
 * @description Authentication edge middleware enforcing session checks and DevLab SSO redirect.
 * @module @finai/web/middleware
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { StorageKey } from "@finai/shared-types";
import { DEVLAB_PORTAL_ROUTES } from "@/lib/routes";

/**
 * Authentication middleware running before route execution.
 * Checks for authentication token cookies and redirects unauthenticated users
 * directly to the DevLab Portal Web UI login.
 */
export function middleware(request: NextRequest) {
  // 1. If returning from DevLab Portal SSO with token in query params
  const tokenParam =
    request.nextUrl.searchParams.get("token") || request.nextUrl.searchParams.get("access_token");

  if (tokenParam) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("token");
    cleanUrl.searchParams.delete("access_token");

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

  if (!token) {
    return NextResponse.redirect(DEVLAB_PORTAL_ROUTES.LOGIN(request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth routes (login, register, forgot-password, reset-password)
     * - static asset files (containing a dot: .png, .jpg, .svg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password|reset-password|.*\\..*).*)",
  ],
};
