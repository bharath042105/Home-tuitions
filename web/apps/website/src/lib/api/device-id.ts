const DEVICE_ID_KEY = "hometuitions_device_id";

/**
 * Backend binds every refresh token to a deviceId (docs/phase2/03-low-level-design.md  3),
 * so a stolen refresh token can't be replayed from a different browser/session.
 * One random id per browser, persisted so refresh keeps working across page reloads.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "server"; // SSR has no persistent identity; refresh calls only happen client-side
  }
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
