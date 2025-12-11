import { test, expect } from "@playwright/test";
import { userSession } from "../helpers/user-session";

test.describe("Accounts Page", () => {
  const adminUserEmail = "test.admin@cds-snc.ca";
  const testUserEmail = "test.user@cds-snc.ca";
  const deactivatedUserEmail = "test.deactivated@cds-snc.ca";

  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for the beforeEach hook since login and page load can take time
    test.setTimeout(40000);
    await userSession(page, { admin: true });
    await page.goto("/en/admin/accounts");
    await page.waitForLoadState("networkidle");
  });

  test("Accounts page loads with title", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Accounts");
  });

  test.describe("Accounts tabs/filters and cards", () => {
    test("Clicking tabs/filters updates with expected content", async ({ page }) => {
      await page.getByRole("button", { name: "All" }).click();
      await expect(page.getByTestId(adminUserEmail)).toBeVisible();
      await expect(page.getByTestId(testUserEmail)).toBeVisible();
      await expect(page.getByTestId(deactivatedUserEmail)).toBeVisible();

      await page.getByRole("button", { name: "Active" }).click();
      await expect(page.getByTestId(adminUserEmail)).toBeVisible();
      await expect(page.getByTestId(testUserEmail)).toBeVisible();
      await expect(page.getByTestId(deactivatedUserEmail)).not.toBeVisible();

      await page.getByRole("button", { name: "Deactivated" }).click();
      await expect(page.getByTestId(deactivatedUserEmail)).toBeVisible();
      await expect(page.getByTestId(adminUserEmail)).not.toBeVisible();
      await expect(page.getByTestId(testUserEmail)).not.toBeVisible();
    });

    test("Clicking manage forms navigates to the related page", async ({ page }) => {
      await page.getByRole("button", { name: "All" }).click();
      await page.getByTestId(testUserEmail).getByRole("link", { name: "Manage forms" }).click();
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Manage forms");
    });
  });
});
