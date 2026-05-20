import { defineConfig, devices } from "@playwright/test";

const isolatedSchemaName = process.env.PLAYWRIGHT_DB_SCHEMA ?? "playwright";
const playwrightPort = process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? "3000";
const playwrightBaseUrl = `http://localhost:${playwrightPort}`;

function getPlaywrightDatabaseUrl() {
  if (process.env.PLAYWRIGHT_DATABASE_URL) {
    return process.env.PLAYWRIGHT_DATABASE_URL;
  }

  if (process.env.PLAYWRIGHT_ISOLATE_DB !== "true") {
    return process.env.DATABASE_URL;
  }

  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  const databaseUrl = new URL(process.env.DATABASE_URL);
  databaseUrl.searchParams.set("schema", isolatedSchemaName);
  return databaseUrl.toString();
}

const playwrightDatabaseUrl = getPlaywrightDatabaseUrl();

const webServerEnv = Object.fromEntries(
  Object.entries({
    ...process.env,
    APP_ENV: "test",
    DATABASE_URL: playwrightDatabaseUrl,
    NEXT_PUBLIC_APP_ENV: "test",
    PLAYWRIGHT_TEST: "true",
    PORT: playwrightPort,
  }).filter((entry): entry is [string, string] => typeof entry[1] === "string")
);

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 3 : 0,
  /* Use more workers in CI for faster execution */
  workers: process.env.PLAYWRIGHT_WORKERS
    ? parseInt(process.env.PLAYWRIGHT_WORKERS)
    : process.env.CI
      ? 4
      : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [["github"], ["list"]] : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: playwrightBaseUrl,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Take screenshot only on failures */
    screenshot: "only-on-failure",
    /* Ensure browser is visible in UI mode (headless only in CI) */
    headless: !!process.env.CI,
  },

  /* Global setup and teardown */
  globalSetup: "./tests/global-setup",

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup-auth",
      testDir: "./tests",
      testMatch: "**/auth.setup.ts",
    },
    {
      name: "setup-auth-admin",
      testDir: "./tests",
      testMatch: "**/auth-admin.setup.ts",
    },
    {
      name: "Chromium",
      use: {
        ...devices["Desktop Chromium"],
        headless: !!process.env.CI, // Run headless only in CI
        launchOptions: {
          // Small slowMo only in CI to help with React state synchronization
          slowMo: process.env.CI ? 50 : 0,
        },
        storageState: "tests/.auth/user.json",
      },
      dependencies: ["setup-auth", "setup-auth-admin"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "yarn db:test && yarn build:test && yarn start:test",
    env: webServerEnv,
    url: playwrightBaseUrl,
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "true",
    timeout: 120 * 1000,
  },
});
