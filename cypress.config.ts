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
          const dbTearDown = await import("./__utils__/dbTearDown");
          await dbTearDown.default();
          return null;
        },
        "db:seed": async () => {
          logMessage.info("Seeding database");
          const seed = await import("./prisma/seeds/seed");
          await seed.default("test");
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
