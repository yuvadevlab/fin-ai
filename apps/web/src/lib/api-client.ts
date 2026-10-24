/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorageKey } from "@finai/shared-types";
import { APP_ROUTES } from "./routes";
import { DEFAULT_API_BASE_URL } from "./app-constants";

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
      headers.set("Authorization", `Bearer ${token}`);
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
    // If unauthorized, redirect to login on the client
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(StorageKey.TOKEN);
      localStorage.removeItem(StorageKey.USER);
      localStorage.removeItem(StorageKey.WORKSPACE_ID);
      document.cookie = `${StorageKey.TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${StorageKey.WORKSPACE_ID}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      if (
        window.location.pathname !== APP_ROUTES.LOGIN &&
        window.location.pathname !== APP_ROUTES.REGISTER
      ) {
        window.location.href = APP_ROUTES.LOGIN;
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
