import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [tsconfigPaths()],
  esbuild: {
    jsx: 'automatic',
  },
  optimizeDeps: {
    include: ['react/jsx-dev-runtime']
  },
  test: {
    globals: true, // migration from Jest - By default, vitest does not provide global APIs for explicitness
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    // Note: The following pattern .vitest.ts has been added to avoid conflicts with jest tests co-located with the source code
    include: [
      "__vitests__/**/*.test.ts",
      "lib/vitests/**/*.test.ts",
      "**/*.vitest.+(ts|tsx|js|jsx)",
    ],
    // Browser mode configuration
    browser: {
      enabled: process.env.VITEST_BROWSER === "true", // Enable via environment variable
      provider: playwright(),
      instances: [
        {
          browser: "chromium"
        }
      ],
      // Optionally specify headless mode for CI
      headless: !!process.env.CI,
    },
  },
  define: {
    // Define some minimal environment variables for browser
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'test'),
    'process.env.CI': JSON.stringify(process.env.CI || ''),
  },
});
