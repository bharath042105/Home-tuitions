const DEVICE_ID_KEY = "hometuitions_admin_device_id";

/** Mirrors web/apps/website/src/lib/api/device-id.ts - the backend binds every
 *  refresh token to a deviceId regardless of which frontend calls it. */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
