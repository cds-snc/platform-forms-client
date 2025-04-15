import { defineConfig } from "cypress";
import { logMessage } from "@lib/logger";
import terminalReport from "cypress-terminal-report/src/installLogsPrinter";

export default defineConfig({
  video: false,
  defaultCommandTimeout: 15000,
  e2e: {
    specPattern: "cypress/release-test/tests/**/*.cy.{js,jsx,ts,tsx}",
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
    runMode: 3,
    openMode: 0,
  },
});
