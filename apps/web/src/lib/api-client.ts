/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorageKey } from "@fin-ai/shared-types";
import { APP_ROUTES } from "./routes";
import { DEFAULT_API_BASE_URL } from "./app-constants";
import { isJwtExpired } from "./jwt";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : DEFAULT_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(data?.message || data?.error?.message || "API Error");
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function shouldRedirectToLogin(pathname: string): boolean {
  if (
    pathname === APP_ROUTES.LOGIN ||
    pathname === APP_ROUTES.REGISTER ||
    pathname === APP_ROUTES.FORGOT_PASSWORD ||
    pathname === APP_ROUTES.RESET_PASSWORD ||
    pathname === APP_ROUTES.HOME ||
    pathname === APP_ROUTES.FEATURES ||
    pathname.startsWith("/features/") ||
    pathname === APP_ROUTES.EXPENSE_TRACKING ||
    pathname === APP_ROUTES.BUDGET_PLANNING ||
    pathname === APP_ROUTES.AI_FINANCIAL_ADVISOR ||
    pathname === APP_ROUTES.WEALTH_MANAGEMENT ||
    pathname === APP_ROUTES.FINANCIAL_GOALS ||
    pathname === APP_ROUTES.ABOUT ||
    pathname === APP_ROUTES.BLOG ||
    pathname.startsWith("/blog/") ||
    pathname === APP_ROUTES.PRIVACY_POLICY ||
    pathname === APP_ROUTES.TERMS_OF_SERVICE
  ) {
    return false;
  }
  return true;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`;

  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Load token from localStorage or cookie using canonical storage keys
  if (typeof window !== "undefined") {
    let token =
      localStorage.getItem(StorageKey.TOKEN) ||
      localStorage.getItem(StorageKey.DEVLAB_ACCESS_TOKEN) ||
      localStorage.getItem(StorageKey.DEVLAB_AUTH_TOKEN);

    if (!token && typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)(?:finai_token|devlab_access_token)=([^;]+)/);
      if (match?.[1]) {
        token = decodeURIComponent(match[1]);
        localStorage.setItem(StorageKey.TOKEN, token);
        localStorage.setItem(StorageKey.DEVLAB_ACCESS_TOKEN, token);
      }
    }

    if (token) {
      if (isJwtExpired(token)) {
        localStorage.removeItem(StorageKey.TOKEN);
        localStorage.removeItem(StorageKey.USER);
        localStorage.removeItem(StorageKey.DEVLAB_ACCESS_TOKEN);
        localStorage.removeItem(StorageKey.DEVLAB_AUTH_TOKEN);
        localStorage.removeItem(StorageKey.DEVLAB_AUTH_USER);
        localStorage.removeItem(StorageKey.WORKSPACE_ID);
        document.cookie = `${StorageKey.TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${StorageKey.DEVLAB_ACCESS_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${StorageKey.WORKSPACE_ID}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        if (shouldRedirectToLogin(window.location.pathname)) {
          window.location.href = `${APP_ROUTES.LOGIN}?error=session_expired`;
        }
        throw new ApiError(401, { message: "Session expired" });
      }
      headers.set("Authorization", `Bearer ${token}`);
    }

    const activeWorkspaceId = localStorage.getItem(StorageKey.WORKSPACE_ID);
    if (activeWorkspaceId && !headers.has("X-Workspace-Id")) {
      headers.set("X-Workspace-Id", activeWorkspaceId);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    // If unauthorized, purge all session tokens and cookies, then redirect to login
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(StorageKey.TOKEN);
      localStorage.removeItem(StorageKey.USER);
      localStorage.removeItem(StorageKey.DEVLAB_ACCESS_TOKEN);
      localStorage.removeItem(StorageKey.DEVLAB_AUTH_TOKEN);
      localStorage.removeItem(StorageKey.DEVLAB_AUTH_USER);
      localStorage.removeItem(StorageKey.WORKSPACE_ID);
      document.cookie = `${StorageKey.TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${StorageKey.DEVLAB_ACCESS_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${StorageKey.WORKSPACE_ID}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      if (shouldRedirectToLogin(window.location.pathname)) {
        window.location.href = `${APP_ROUTES.LOGIN}?error=session_expired`;
      }
    }
    throw new ApiError(response.status, data);
  }

  // Unwrap the default NestJS TransformInterceptor response if present
  if (data && typeof data === "object" && data !== null && "success" in data && "data" in data) {
    return data.data;
  }

  return data;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
