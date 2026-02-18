import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      reporter: ["text", "json", "html"],
    },
    include: ["src/**/*.test.{ts,tsx,js}", "**/*.test.{ts,tsx,js}"],
  },
});
