/* eslint-disable @typescript-eslint/no-explicit-any */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : "http://localhost:4000/api/v1";

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

  // Load token from localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("finai_token");
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
    // If unauthorized, we can redirect to login on the client
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("finai_token");
      localStorage.removeItem("finai_user");
      localStorage.removeItem("finai_workspace_id");
      document.cookie = "finai_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "finai_workspace_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
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
