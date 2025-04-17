export async function register() {
  if (process.env.NODE_ENV === "development" && process.env.NEXT_RUNTIME === "nodejs") {
    if (!process.env.REDIS_URL) {
      // eslint-disable-next-line no-console
      console.log(
        "No REDIS_URL environment variable found, skipping flags initialization and privilege cache flush"
      );
      return;
    }

    const initialFlags = await import("./deployment/default_flag_settings.json").then(
      (m) => m.default
    );

    // Initialize the feature flags and flush the privilege cache when the app server is started in development mode
    await import("@gcforms/deployment").then(async (m) => {
      await Promise.all([m.initiateFlags(initialFlags), m.flushPrivilegesCache()]);
    });
  }
}
