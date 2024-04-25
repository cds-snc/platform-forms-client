import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    // TODO: remove include after complete Vitest migration
    include: ["__vitests__/**/*.test.ts", "lib/vitests/**/*.test.ts"],
  },
});
