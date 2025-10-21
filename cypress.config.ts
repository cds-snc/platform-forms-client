import { defineConfig } from "cypress";
import { logMessage } from "@lib/logger";

export default defineConfig({
  video: false,
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on) {
      on("before:run", async () => {
        const dbTearDown = await import("./__utils__/dbTearDown");
        logMessage.info("Tearing down database");
        await dbTearDown.default();
        logMessage.info("Seeding database");
        const dbSeed = await import("@gcforms/database/src/seed");
        await dbSeed.default("test");
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
