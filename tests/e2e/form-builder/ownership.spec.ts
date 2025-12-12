import { test, expect } from "@playwright/test";
import { FormUploadHelper } from "../../helpers/form-upload-helper";
import { userSession } from "../../helpers/user-session";

test.describe("Form Ownership", () => {
  let formID: string;

  test.beforeAll(async ({ browser }) => {
    // Create a new page for setup
    const context = await browser.newContext();
    const page = await context.newPage();

    // Authenticate and create the form once
    await userSession(page, { admin: false });
    const formHelper = new FormUploadHelper(page);
    formID = await formHelper.uploadFormFixture("cdsIntakeTestForm");

    // Clean up
    await context.close();
  });

  test.describe("Regular User", () => {
    test("Non-Admin cannot manage Form Ownership", async ({ page }) => {
      await userSession(page, { admin: false });
      await page.goto(`/en/form-builder/${formID}/settings`);
      await page.waitForLoadState("networkidle");

      await expect(page.getByTestId("form-ownership")).not.toBeVisible();
    });
  });

  test.describe("Admin User", () => {
    test.beforeEach(async ({ page }) => {
      await userSession(page, { admin: true });
      await page.goto(`/en/form-builder/${formID}/settings`);
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
