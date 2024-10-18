import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true, // migration from Jest - By default, vitest does not provide global APIs for explicitness
    environment: "node",
    // Note: The following pattern .vi.test.ts has been added to avoid conflicts with jest tests co-located with the source code
    include: ["__vitests__/**/*.test.ts", "lib/vitests/**/*.test.ts", "**/*.vitest.+(ts|tsx|js|jsx)"],
  },
});
