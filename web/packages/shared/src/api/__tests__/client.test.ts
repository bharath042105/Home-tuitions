import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "../client";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("createApiClient", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("attaches the access token and device id headers to every request", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = createApiClient({
      baseUrl: "http://api.test",
      getAccessToken: () => "token-123",
      getDeviceId: () => "device-abc",
    });

    await client.get("/ping");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer token-123");
    expect(init.headers["X-Device-Id"]).toBe("device-abc");
  });

  it("retries exactly once after onUnauthorized reports a successful refresh", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { code: "INVALID_TOKEN" }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const onUnauthorized = vi.fn().mockResolvedValue(true);

    const client = createApiClient({
      baseUrl: "http://api.test",
      getAccessToken: () => "token",
      getDeviceId: () => "device",
      onUnauthorized,
    });

    const result = await client.get<{ ok: boolean }>("/secure");

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("does not retry a second time if the retried request also 401s (avoids an infinite loop)", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(401, {}));
    const onUnauthorized = vi.fn().mockResolvedValue(true);

    const client = createApiClient({
      baseUrl: "http://api.test",
      getAccessToken: () => "token",
      getDeviceId: () => "device",
      onUnauthorized,
    });

    await expect(client.get("/secure")).rejects.toThrow(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onUnauthorized).toHaveBeenCalledTimes(1); // not called again on the retry's 401
  });

  it("throws without retrying when onUnauthorized reports the refresh itself failed", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, {}));
    const onUnauthorized = vi.fn().mockResolvedValue(false);

    const client = createApiClient({
      baseUrl: "http://api.test",
      getAccessToken: () => null,
      getDeviceId: () => "device",
      onUnauthorized,
    });

    await expect(client.get("/secure")).rejects.toThrow(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("resolves 204 No Content as undefined instead of trying to parse an empty body as JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const client = createApiClient({
      baseUrl: "http://api.test",
      getAccessToken: () => "token",
      getDeviceId: () => "device",
    });

    await expect(client.del("/thing/1")).resolves.toBeUndefined();
  });

  it("resolves any status with an empty body (e.g. 201 Created from /auth/register) as undefined rather than throwing on response.json()", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    const client = createApiClient({
      baseUrl: "http://api.test",
      getAccessToken: () => null,
      getDeviceId: () => "device",
    });

    await expect(client.post("/auth/register", { email: "a@b.com" })).resolves.toBeUndefined();
  });
});
