import { defineConfig } from "cypress";
import { logMessage } from "@lib/logger";
import dbTearDown from "./__utils__/dbTearDown";
import dbSeed from "@gcforms/database/seed";

export default defineConfig({
  video: false,
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on) {
      on("before:run", async () => {
        logMessage.info("Tearing down database");
        await dbTearDown();
        logMessage.info("Seeding database");
        await dbSeed("test");
      });
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
