import { defineConfig } from "cypress";
import { logMessage } from "@lib/logger";
import terminalReport from "cypress-terminal-report/src/installLogsPrinter";

// Override the baseUrl with a var
// e.g. CYPRESS_BASE_URL=https://forms-formulaires.alpha.canada.ca cypress run --browser chrome --spec cypress/e2e/release-tests/form_submission.cy.ts

export default defineConfig({
  video: false,
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: "https://forms-formulaires.alpha.canada.ca",
    setupNodeEvents(on) {
      if (process.env.CYPRESS_DEBUG) {
        logMessage.info("Enabling terminal report for Debugging");
        terminalReport(on);
      }
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
  retries: {
    // Configure retry attempts for `cypress run`
    // Default is 0
    runMode: 3,
    // Configure retry attempts for `cypress open`
    // Default is 0
    openMode: 0,
  },
});
