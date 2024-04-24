import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true, // migration from Jest - By default, vitest does not provide global APIs for explicitness
    environment: "node",
    // TODO: remove include after complete Vitest migration
    include: ["__vitests__/**/*.ts", "lib/vitests/**/*.ts"],
  },
});
