import { test as setup } from "@playwright/test";
import { userSession } from "./helpers";
import { logMessage } from "@root/lib/logger";

const authFile = "tests/.auth/user.json";

setup("authenticate", async ({ page }) => {
  logMessage.info("Setting up authenticated user session for tests");
  await userSession(page, {
    admin: false,
    acceptableUse: true,
  });

  logMessage.info("Saving authentication state to " + authFile);
  await page.context().storageState({ path: authFile });
});
