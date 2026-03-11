import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "@root/tests/helpers";

test.describe("Form Ownership", () => {
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({ fixtureName: "cdsIntakeTestForm", published: false });
  });

  test.afterAll(async () => {
    // Clean up: delete the template and disconnect
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
  });

  test.describe("Regular User", () => {
    test("Non-Admin cannot manage Form Ownership", async ({ page }) => {
      await page.goto(`/en/form-builder/${formId}/settings`);
      await page.waitForLoadState("networkidle");

      await expect(page.getByTestId("form-ownership")).not.toBeVisible();
    });
  });

  test.describe("Admin User", () => {
    test.use({ storageState: "tests/.auth/user-admin.json" });

    test.beforeEach(async ({ page }) => {
      await page.goto(`/en/form-builder/${formId}/settings`);
      await page.waitForLoadState("networkidle");
    });

    test("Admin can manage Form Ownership", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 2, name: "Manage ownership" })).toBeVisible();
      await expect(page.getByTestId("form-ownership")).toBeVisible();
    });

    test("Must have at least one owner", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 2, name: "Manage ownership" })).toBeVisible();
      await expect(page.getByTestId("form-ownership")).toBeVisible();

      await page.locator("[aria-label='Remove test.user@cds-snc.ca']").click();
      await expect(page.getByTestId("form-ownership")).not.toContainText("test.user@cds-snc.ca");

      await page.getByTestId("save-ownership").click();
      await expect(page.getByTestId("alert")).toContainText("Must assign at least one user");
      await expect(page.getByTestId("alert")).toBeVisible();
    });
  });
});
