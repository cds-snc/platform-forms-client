import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "@root/tests/helpers";
import { prisma } from "@gcforms/database";

test.describe("Form Ownership", () => {
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({ fixtureName: "cdsIntakeTestForm", published: false });
  });

  test.describe("Regular User", () => {
    test.use({ storageState: "tests/.auth/user.json" });

    test("Regular user can visit route but is redirected", async ({ page }) => {
      // Derive the account (user) id for the known test user rather than using a hardcoded fallback
      const ownerUser = await prisma.user.findUnique({ where: { email: "test.user@cds-snc.ca" } });
      if (!ownerUser) throw new Error("Test user test.user@cds-snc.ca not found in database");

      const accountId = ownerUser.id;

      // Regular users are redirected when attempting to access admin manage-forms
      await page.goto(`/en/admin/accounts/${accountId}/manage-forms`);
      // Expect a redirect to the unauthorized page
      await page.waitForURL(/.*\/unauthorized/, { timeout: 10000 });
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Page not found");
    });
  });

  test.afterAll(async () => {
    // Clean up: delete the template and disconnect
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
  });

  test.describe("Admin User", () => {
    test.use({ storageState: "tests/.auth/user-admin.json" });

    test.beforeEach(async ({ page }) => {
      // Derive the account (user) id for the known test user rather than using a hardcoded fallback
      const ownerUser = await prisma.user.findUnique({ where: { email: "test.user@cds-snc.ca" } });
      if (!ownerUser) throw new Error("Test user test.user@cds-snc.ca not found in database");

      const accountId = ownerUser.id;

      await page.goto(`/en/admin/accounts/${accountId}/manage-forms`);
      await page.waitForLoadState("networkidle");
      // The list can be slow; wait for the first form card and the Manage ownership link to appear
      const firstFormCard = page.locator('li[id^="form-"]').first();
      await firstFormCard.waitFor({ state: "visible", timeout: 20000 });
      await firstFormCard
        .getByRole("link", { name: "Manage ownership" })
        .waitFor({ state: "visible", timeout: 10000 });
    });

    test("Must have at least one owner", async ({ page }) => {
      // Open the manage ownership UI for the first form in the list (link navigates to manageOwnership query param which opens the modal)
      const firstFormCard = page.locator('li[id^="form-"]').first();
      await firstFormCard.getByRole("link", { name: "Manage ownership" }).click();

      // wait for the URL to include the manageOwnership query param and for the modal to render
      await page.waitForURL(/.*manageOwnership=.*/);
      await page.getByTestId("form-ownership").waitFor({ state: "visible", timeout: 10000 });
      await expect(page.getByTestId("form-ownership")).toBeVisible();

      await page.locator("[aria-label='Remove test.user@cds-snc.ca']").click();
      await expect(page.getByTestId("form-ownership")).not.toContainText("test.user@cds-snc.ca");

      // Wait for the save button to appear and be enabled before clicking (handles slow UI)
      const saveButton = page.getByTestId("save-ownership");
      await saveButton.waitFor({ state: "visible", timeout: 30000 });
      await expect(saveButton).toBeEnabled({ timeout: 30000 });
      await saveButton.click();

      await expect(page.getByTestId("alert")).toContainText("Must assign at least one user");
      await expect(page.getByTestId("alert")).toBeVisible();
    });
  });
});
