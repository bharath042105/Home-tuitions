import { createApiClient } from "@hometuitions/shared";
import { getDeviceId } from "./device-id";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

const REFRESH_TOKEN_KEY = "hometuitions_admin_refresh_token";

// Mirrors web/apps/website/src/lib/api/client.ts exactly - two separate frontends
// talking to the same backend contract, so the token-handling shape is identical.
let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function isLoggedIn(): boolean {
  return accessToken !== null || (typeof window !== "undefined" && !!window.localStorage.getItem(REFRESH_TOKEN_KEY));
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
  getAccessToken,
  getDeviceId,
  onUnauthorized: () => {
    if (!refreshInFlight) {
      refreshInFlight = refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
    }
    return refreshInFlight;
  },
});
