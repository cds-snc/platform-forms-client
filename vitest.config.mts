import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import path from "path";

const sharedAliases = {
  "@responses-pilot": path.resolve(
    __dirname,
    "app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses-pilot"
  ),
  "next/server": path.resolve(__dirname, "./__mocks__/next/server.ts"),
  "next-auth/lib/env": path.resolve(__dirname, "./__mocks__/next-auth/lib/env.js"),
  "@lib": path.resolve(__dirname, "./lib"),
};

const sharedDefine = {
  "process.env.VITEST_BROWSER": JSON.stringify(process.env.VITEST_BROWSER || "false"),
  "process.env.VITEST_WATCH": JSON.stringify(process.env.VITEST_WATCH || "false"),
  "process.env.APP_ENV": JSON.stringify(process.env.APP_ENV || "test"),
  global: "globalThis",
};

const sharedExclude = [
  "**/node_modules/**",
  "**/dist/**",
  "**/.next/**",
  "**/coverage/**",
  "tests/playwright/**",
  "tests/**/*.setup.ts",
  "playwright-report/**",
  "test-results/**",
  "packages/core/**",
];

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: sharedAliases,
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
  },
  define: sharedDefine,
  css: { postcss: "./postcss.config.js" },
  optimizeDeps: {
    include: [
      "@testing-library/react",
      "react",
      "react-dom",
      "next/navigation",
      "native-file-system-adapter",
      "usehooks-ts",
    ],
  },
  test: {
    globals: true,
    clearMocks: true,
    isolate: true,
    fileParallelism: true,
    projects:
      process.env.VITEST_BROWSER === "true"
        ? [
            {
              extends: true,
              test: {
                name: "browser",
                include: [
                  "tests/browser/**/*.browser.vitest.+(ts|tsx|js|jsx)",
                  "**/*.browser.vitest.+(ts|tsx|js|jsx)",
                ],
                exclude: sharedExclude,
                browser: {
                  enabled: true,
                  provider: playwright({ launchOptions: { slowMo: 250 } }),
                  instances: [{ browser: "chromium" }],
                  headless: process.env.CI === "true",
                  viewport: { width: 768, height: 1024 },
                },
              },
            },
          ]
        : [
            {
              extends: true,
              test: {
                name: "vitest",
                environment: "node",
                include: [
                  "__vitests__/**/*.test.ts",
                  "lib/vitests/**/*.test.ts",
                  "**/*.test.+(ts|tsx|js|jsx)",
                  "**/*.vitest.+(ts|tsx|js|jsx)",
                ],
                exclude: [...sharedExclude, "**/*.browser.vitest.+(ts|tsx|js|jsx)"],
                setupFiles: [
                  "./__utils__/vitest.setup.ts",
                  "./__utils__/prismaConnector.ts",
                ],
              },
            },
          ],
  },
});
