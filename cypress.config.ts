import { defineConfig } from "cypress";
import { logMessage } from "@lib/logger";

export default defineConfig({
  video: false,
  defaultCommandTimeout: 10000,

  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on) {
      on("task", {
        "db:teardown": async () => {
          logMessage.info("Tearing down database");
          await import("./__utils__/dbTearDown").then((dbTearDown) => dbTearDown.default());
          // Return arbitrary value to let Cypress know that promise resolved
          return null;
        },
        "db:seed": async () => {
          logMessage.info("Seeding database");
          import("./prisma/seeds/seed").then((seed) => seed.default("test"));
          // Return arbitrary value to let Cypress know that promise resolved
          return null;
        },
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
