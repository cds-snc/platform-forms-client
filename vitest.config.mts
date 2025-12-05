import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import path from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@responses-pilot": path.resolve(__dirname, "app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses-pilot"),
    },
  },
  define: {
    "process.env.VITEST_BROWSER": JSON.stringify(process.env.VITEST_BROWSER || "false"),
    "process.env.VITEST_WATCH": JSON.stringify(process.env.VITEST_WATCH || "false"),
    global: "globalThis",
  },
  css: {
    postcss: "./postcss.config.js",
  },
  optimizeDeps: {
    include: [
      "@testing-library/react",
      "react",
      "react-dom",
      "next/navigation",
      "native-file-system-adapter",
    ],
  },
  test: {
    globals: true,
    environment: "node",
    include:
      process.env.VITEST_BROWSER === "true"
        ? ["tests/browser/**/*.browser.vitest.+(ts|tsx|js|jsx)", "**/*.browser.vitest.+(ts|tsx|js|jsx)"]
        : ["__vitests__/**/*.test.ts", "lib/vitests/**/*.test.ts", "**/*.vitest.+(ts|tsx|js|jsx)"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      ...(process.env.VITEST_BROWSER === "true" ? [] : ["**/*.browser.vitest.+(ts|tsx|js|jsx)"]),
    ],
    browser: {
      enabled: process.env.VITEST_BROWSER === "true",
      provider: playwright({
        launchOptions: {
          slowMo: 250, // Slow down by 250ms for better visibility
        },
      }),
      instances: [{ browser: "chromium" }],
      headless: process.env.CI === "true", // Headless in CI, headed locally
    },
    setupFiles: process.env.VITEST_BROWSER === "true" ? ["./tests/browser/setup.ts"] : [],
    isolate: true,
    fileParallelism: false,
  },
});
