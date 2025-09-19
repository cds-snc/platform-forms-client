import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
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
  reporter: process.env.CI ? "github" : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Take screenshot only on failures */
    screenshot: "only-on-failure",
  },

  /* Global setup and teardown */
  globalSetup: require.resolve("./tests/global-setup"),

  /* Configure projects for major browsers */
  projects: [
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "yarn build:test && yarn start:test",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
