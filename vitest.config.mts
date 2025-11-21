import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("test"),
    "process.env.VITEST_BROWSER": JSON.stringify(process.env.VITEST_BROWSER || "false"),
    "process.env": "{}",
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
    globals: true, // migration from Jest - By default, vitest does not provide global APIs for explicitness
    environment: process.env.VITEST_BROWSER === "true" ? "node" : "node",
    // Note: The following pattern .vitest.ts has been added to avoid conflicts with jest tests co-located with the source code
    include: process.env.VITEST_BROWSER === "true"
      ? ["**/*.browser.vitest.+(ts|tsx|js|jsx)"]
      : [
          "__vitests__/**/*.test.ts",
          "lib/vitests/**/*.test.ts",
          "**/*.vitest.+(ts|tsx|js|jsx)",
        ],
    exclude:
      process.env.VITEST_BROWSER === "true"
        ? ["**/node_modules/**", "**/dist/**"]
        : ["**/*.browser.vitest.tsx", "**/*.browser.vitest.ts", "**/node_modules/**", "**/dist/**"],
    browser: {
      enabled: process.env.VITEST_BROWSER === "true",
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: false, // Always show browser window
    },
  },
});
