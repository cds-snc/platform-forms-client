export async function register() {
  if (process.env.NODE_ENV === "development" && process.env.NEXT_RUNTIME === "nodejs") {
    if (!process.env.REDIS_URL) {
      // eslint-disable-next-line no-console
      console.log(
        "No REDIS_URL environment variable found, skipping flags initialization and privilege cache flush"
      );
      return;
    }

    // Import prisma client
    const prisma = await import("@lib/integration/prismaConnector").then((m) => m.prisma);

    // Initialize the feature flags and flush the privilege cache when the app server is started in development mode
    await import("@gcforms/initializer").then(async (m) => {
      await Promise.all([
        m.initiateFlags(),
        m.flushPrivilegesCache(),
        m.prismaSeed(prisma, "development"),
      ]);
    });
  }
}
