export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Flush the privilege cache for users when the app server is started
    // This ensures that if privileges were changed they take immediate global effect.

    // We cannot reuse the same function from the main application because Pino is not compatible
    // with this runtime. We need to use the native console.log function instead.
    if (!process.env.REDIS_URL) throw new Error("No Redis URL is configured");
    const Redis = await import("ioredis").then((m) => m.default);
    const redis = new Redis(process.env.REDIS_URL);

    const stream = redis.scanStream({
      match: "auth:privileges:*",
    });
    stream.on("data", function (keys: string[]) {
      // `keys` is an array of strings representing key names
      if (keys.length) {
        const pipeline = redis.pipeline();
        keys.forEach(function (key: string) {
          pipeline.del(key);
        });
        pipeline.exec();
      }
    });
    return new Promise<void>((resolve) =>
      stream.on("end", () => {
        // eslint-disable-next-line no-console
        console.log("Cached Privileges have been cleared");
        resolve();
      })
    );
  }
}
