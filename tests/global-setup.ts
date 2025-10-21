import { FullConfig } from "@playwright/test";
import { logMessage } from "@lib/logger";
import dbTearDown from "../__utils__/dbTearDown";
import dbSeed from "@gcforms/database/src/seed";

async function globalSetup(_config: FullConfig) {
  logMessage.info("Playwright Global Setup: Tearing down database");
  await dbTearDown();

  logMessage.info("Playwright Global Setup: Seeding database");
  await dbSeed("test");

  logMessage.info("Playwright Global Setup: Complete");
}

export default globalSetup;
