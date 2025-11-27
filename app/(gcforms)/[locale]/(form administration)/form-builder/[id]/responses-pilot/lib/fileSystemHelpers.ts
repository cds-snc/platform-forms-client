/**
 * Helpers to verify File System Access API permissions for stored handles.
 * See: https://developer.chrome.com/docs/capabilities/web-apis/file-system-access#stored_file_or_directory_handles_and_permissions
 */
type PermissionMode = "read" | "readwrite";

type MaybePermissionHandle = {
  queryPermission?: (desc: { mode: PermissionMode }) => Promise<"granted" | "denied" | "prompt">;
  requestPermission?: (desc: { mode: PermissionMode }) => Promise<"granted" | "denied" | "prompt">;
};

export const verifyPermission = async (
  handle: unknown,
  mode: PermissionMode = "readwrite"
): Promise<boolean> => {
  if (!handle || typeof handle !== "object") return false;

  const desc = { mode } as { mode: PermissionMode };

  try {
    const h = handle as MaybePermissionHandle;

    if (typeof h.queryPermission === "function") {
      const current = await h.queryPermission(desc);

      // eslint-disable-next-line no-console
      console.info(`verifyPermission: current permission for mode ${mode}:`, current);

      if (current === "granted") return true;

      if (typeof h.requestPermission === "function") {
        try {
          const requested = await h.requestPermission(desc);
          return requested === "granted";
        } catch (err) {
          // requestPermission may throw (e.g., NotAllowedError) — treat as denied
          // eslint-disable-next-line no-console
          console.warn("verifyPermission: requestPermission threw", err);
          return false;
        }
      }

      return false;
    }
  } catch (err) {
    // Some platforms/browsers may throw; treat as permission denied
    // eslint-disable-next-line no-console
    console.warn("verifyPermission: permission API threw", err);
    return false;
  }

  // If the handle doesn't expose permission APIs, do not assume permission.
  return false;
};

export default verifyPermission;
