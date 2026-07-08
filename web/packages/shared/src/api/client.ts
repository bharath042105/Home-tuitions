export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken: () => string | null;
  getDeviceId: () => string;
  /** Called on a 401; expected to refresh and update whatever getAccessToken() reads from.
   *  Return false if refresh itself failed (caller should not retry). */
  onUnauthorized?: () => Promise<boolean>;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

/**
 * Thin fetch wrapper shared by apps/website and apps/admin so both talk to the
 * backend the same way (JWT attach, JSON parsing, typed errors). Deliberately
 * fetch-based (not axios) per Next.js 15 conventions - no extra HTTP client dependency.
 */
export function createApiClient(config: ApiClientConfig) {
  async function doFetch(path: string, init?: RequestInit): Promise<Response> {
    const token = config.getAccessToken();
    return fetch(`${config.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": config.getDeviceId(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  }

  async function request<T>(path: string, init?: RequestInit, isRetry = false): Promise<T> {
    let response = await doFetch(path, init);

    if (response.status === 401 && !isRetry && config.onUnauthorized) {
      const refreshed = await config.onUnauthorized();
      if (refreshed) {
        return request<T>(path, init, true);
      }
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApiError(response.status, body.code ?? "UNKNOWN_ERROR", body.message ?? response.statusText);
    }

    // Read as text first rather than special-casing only 204: a 201 Created (e.g.
    // /auth/register) can legitimately have an empty body too, and calling
    // response.json() directly on an empty body throws "Unexpected end of JSON input".
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: "GET" }),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
    del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
