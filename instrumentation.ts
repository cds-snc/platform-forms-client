export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Flush the privilege cache for users when the app server is started
    // This ensures that if privileges were changed they take immediate global effect.

    // We cannot reuse the same function from the main application because Pino is not compatible
    // with this runtime. We need to use the native console.log function instead.
    if (!process.env.REDIS_URL) {
      // eslint-disable-next-line no-console
      console.log("No REDIS_URL environment variable found, skipping flags initialization and privilege cache flush");
      return;
    }
    await import("@lib/flags/initialization").then(async (m) => {
      m.initiateFlags();
    });
    await import("@lib/cache/privilegeCache").then(async (m) => {
      m.flushValues();
    });
  }
}
