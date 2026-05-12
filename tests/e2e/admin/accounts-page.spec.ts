import { test, expect } from "@playwright/test";

test.describe("Accounts Page", () => {
  const adminUserEmail = "test.admin@cds-snc.ca";
  const testUserEmail = "test.user@cds-snc.ca";
  const deactivatedUserEmail = "test.deactivated@cds-snc.ca";

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/admin/accounts");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Authenticated Admin User", () => {
    test.use({ storageState: "tests/.auth/user-admin.json" });

    test("Accounts page loads with title", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Accounts");
    });

    test.describe("Accounts search and cards", () => {
      test.skip("Submitting email search updates with expected content", async ({ page }) => {
        await page.locator("#accounts-query").fill(testUserEmail);
        await page.getByRole("button", { name: "Search" }).click();

        await expect(page.getByTestId(testUserEmail)).toBeVisible();
        await expect(page.getByTestId(adminUserEmail)).not.toBeVisible();
        await expect(page.getByTestId(deactivatedUserEmail)).not.toBeVisible();
      });

      test.skip("Submitting deactivated status search updates with expected content", async ({
        page,
      }) => {
        await page.locator("#accounts-status").selectOption("deactivated");
        await page.getByRole("button", { name: "Search" }).click();

        await expect(page.getByTestId(deactivatedUserEmail)).toBeVisible();
        await expect(page.getByTestId(adminUserEmail)).not.toBeVisible();
        await expect(page.getByTestId(testUserEmail)).not.toBeVisible();
      });

      test.skip("Clicking manage forms navigates to the related page", async ({ page }) => {
        await page.locator("#accounts-query").fill(testUserEmail);
        await page.getByRole("button", { name: "Search" }).click();
        await page.getByTestId(testUserEmail).getByRole("link", { name: "Manage forms" }).click();

        // Wait for navigation to complete
        await page.waitForURL(/.*manage-forms.*/);
        await expect(page.getByRole("heading", { level: 1 })).toContainText("Manage forms");
      });
    });
  });
});
