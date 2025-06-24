import { defineConfig } from "cypress";
import { logMessage } from "@lib/logger";
import terminalReport from "cypress-terminal-report/src/installLogsPrinter";

// Default form URLs. Can override with `FORM_URL` environment variable
const FORM_STAGING_URL =
  "https://2rzfpgwt6iu2p524yhtlis7yfy0yyxhk.lambda-url.ca-central-1.on.aws/en/id/cmcahuj400000k00btz7n4guz";
const FORM_PRODUCTION_URL =
  "https://forms-formulaires.alpha.canada.ca/en/id/cmcai1v0n0066yg01z5631t6a";

function getFormUrl() {
  // Allow overriding the form URL via environment variable for testing purposes
  if (process.env.FORM_URL) {
    return process.env.FORM_URL;
  }

  if (process.env.APP_ENV === "production") {
    return FORM_PRODUCTION_URL;
  }
  return FORM_STAGING_URL;
}

export default defineConfig({
  video: false,
  defaultCommandTimeout: 5000,
  e2e: {
    specPattern: "cypress/hcaptcha-test/tests/**/*.cy.{js,jsx,ts,tsx}",
    baseUrl: getFormUrl(),
    setupNodeEvents(on) {
      if (process.env.CYPRESS_DEBUG) {
        logMessage.info("Enabling terminal report for Debugging");
        terminalReport(on);
      }

      logMessage.info(`Running in environment: ${process.env.APP_ENV}`);
      logMessage.info(`Form URL: ${getFormUrl()}`);
    },
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
  retries: {
    runMode: 3,
    openMode: 0,
  },
});
