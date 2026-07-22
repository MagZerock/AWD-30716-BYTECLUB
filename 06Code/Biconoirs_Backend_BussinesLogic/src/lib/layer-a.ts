import { ApiError } from "./api-error";

const LAYER_A_BASE = process.env.LAYER_A_URL || "https://biconoirs-class-op.duckdns.org/ops";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | undefined>;
}

async function layerAFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOpts } = options;

  let url = `${LAYER_A_BASE}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) searchParams.set(key, value);
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOpts.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...fetchOpts, headers });

  if (!res.ok) {
    const errorBody = await res.text();
    let message = `Error ${res.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || message;
    } catch {}
    throw new ApiError(res.status, message);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

export const layerA = {
  get: <T>(path: string, options?: FetchOptions) =>
    layerAFetch<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    layerAFetch<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    layerAFetch<T>(path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    layerAFetch<T>(path, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string, options?: FetchOptions) =>
    layerAFetch<T>(path, { ...options, method: "DELETE" }),
};
