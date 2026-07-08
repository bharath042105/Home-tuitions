import { createApiClient } from "@hometuitions/shared";
import { getDeviceId } from "./device-id";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

const REFRESH_TOKEN_KEY = "hometuitions_refresh_token";

// Access token kept in memory only (never localStorage) to reduce XSS blast radius.
// Refresh token is longer-lived and needed across reloads, so it's the one thing
// persisted client-side - acceptable since it's single-use-then-rotated (see LLD  3),
// unlike the access token which would be directly usable if stolen.
let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

/** Exposed for the STOMP client (chat) - the WebSocket CONNECT frame needs the
 *  current access token but isn't itself an apiClient request. */
export function getAccessToken(): string | null {
  return accessToken;
}

function decodeAccessTokenPayload(): Record<string, unknown> | null {
  if (!accessToken) return null;
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

/** Decodes the JWT's `sub` claim client-side rather than adding a "/me" round trip
 *  just to know "is this chat message mine" - the token is already in memory, and
 *  a JWT's payload is base64, not encrypted, so no server call is needed to read it. */
export function getCurrentUserId(): string | null {
  const decoded = decodeAccessTokenPayload();
  return (decoded?.sub as string | undefined) ?? null;
}

/** Same rationale as getCurrentUserId - lets the login page route to a
 *  role-appropriate landing page without a server round trip. */
export function getCurrentUserRole(): string | null {
  const decoded = decodeAccessTokenPayload();
  return (decoded?.role as string | undefined) ?? null;
}

export function setTokens(tokens: TokenResponse | null) {
  accessToken = tokens?.accessToken ?? null;
  if (typeof window !== "undefined") {
    if (tokens?.refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } else {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/api/v1/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
      { method: "POST", headers: { "X-Device-Id": getDeviceId() } },
    );
    if (!response.ok) {
      setTokens(null);
      return false;
    }
    const tokens = (await response.json()) as TokenResponse;
    setTokens(tokens);
    return true;
  } catch {
    setTokens(null);
    return false;
  }
}

export const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  getAccessToken: () => accessToken,
  getDeviceId,
  onUnauthorized: () => {
    // Single-flight: concurrent 401s from parallel requests share one refresh call
    // instead of each independently rotating (rotating twice would invalidate the first).
    if (!refreshInFlight) {
      refreshInFlight = refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
    }
    return refreshInFlight;
  },
});
