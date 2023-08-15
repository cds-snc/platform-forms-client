import { logMessage } from "@lib/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Flush the privilege cache for users when the app server is started
    // This ensures that if privileges were changes they take immediate global effect.
    const { flushValues } = await import("@lib/cache/privilegeCache");
    logMessage.info("Flushing privilege cache");
    await flushValues();
  }
}
