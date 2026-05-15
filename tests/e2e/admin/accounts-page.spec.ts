import { test, expect } from "@playwright/test";

test.describe("Accounts Page", () => {
  const adminUserEmail = "test.admin@cds-snc.ca";
  const testUserEmail = "test.user@cds-snc.ca";
  const deactivatedUserEmail = "test.deactivated@cds-snc.ca";

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/admin/accounts");
  });

  test.describe("Authenticated Admin User", () => {
    test.use({ storageState: "tests/.auth/user-admin.json" });

    test("Accounts page loads with title", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Accounts");
    });

    test.describe("Accounts search and cards", () => {
      test("Submitting email search updates with expected content", async ({ page }) => {
        await page.locator("#accounts-query").fill(testUserEmail);
        await page.getByRole("button", { name: "Search" }).click();

        await expect(page).toHaveURL(/query=test\.user%40cds-snc\.ca/);
        await expect(page.getByTestId(testUserEmail)).toBeVisible();
        await expect(page.getByTestId(adminUserEmail)).not.toBeVisible();
        await expect(page.getByTestId(deactivatedUserEmail)).not.toBeVisible();
      });

      test("Submitting deactivated status search updates with expected content", async ({
        page,
      }) => {
        await page.locator("#accounts-status").selectOption("deactivated");
        await expect(page.locator("#accounts-status")).toHaveValue("deactivated");
        await page.getByRole("button", { name: "Search" }).click();

        await expect(page).toHaveURL(/userState=deactivated/);
        await expect(page.getByTestId(deactivatedUserEmail)).toBeVisible();
        await expect(page.getByTestId(adminUserEmail)).not.toBeVisible();
        await expect(page.getByTestId(testUserEmail)).not.toBeVisible();
      });

      test("Clicking manage forms navigates to the related page", async ({ page }) => {
        await page.locator("#accounts-query").fill(testUserEmail);
        await page.getByRole("button", { name: "Search" }).click();

        await expect(page).toHaveURL(/query=test\.user%40cds-snc\.ca/);
        await expect(page.getByTestId(testUserEmail)).toBeVisible();

        await page.getByTestId(testUserEmail).getByRole("link", { name: "Manage forms" }).click();

        await expect(page).toHaveURL(/.*manage-forms.*/);
        await expect(page.getByRole("heading", { level: 1 })).toContainText("Manage forms");
      });
    });
  });
});
