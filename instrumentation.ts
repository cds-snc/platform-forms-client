export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.LAMBDA_ENV) {
    // Do not collect traces when doing active development or running tests
    if (process.env.NODE_ENV !== "development" && process.env.APP_ENV !== "test") {
      await import("./instrumentation.node");
    }

    if (!process.env.REDIS_URL) {
      // eslint-disable-next-line no-console
      console.log(
        "No REDIS_URL environment variable found, skipping flags initialization and privilege cache flush"
      );
      return;
    }

    // Initialize the feature flags when the app server is started
    await import("@lib/flags/initialization").then(async (m) => {
      m.initiateFlags();
    });

    // Flush the privilege cache for users when the app server is started
    // This ensures that if privileges were changed they take immediate global effect.
    await import("@lib/cache/privilegeCache").then(async (m) => {
      m.flushValues();
    });
  }
}
