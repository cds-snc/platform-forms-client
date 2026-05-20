import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("Publishing a form", () => {
  test.use({ storageState: "tests/.auth/user-admin.json" });

  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    // Create a published template directly in the database
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({ fixtureName: "publishTestForm", published: false });
  });

  test.afterAll(async () => {
    // Clean up: delete the template and disconnect
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
  });

  test("Can publish a form", async ({ page }) => {
    // Navigate to settings page
    await page.goto(`/en/form-builder/${formId}/settings`);
    await page.waitForLoadState("networkidle");

    // Wait for settings page to be ready
    await page.waitForTimeout(1000);

    // We should already be on the settings page, but wait for the Intended Use section
    const intendedUseHeading = page.getByRole("heading", { name: "Intended use" });
    await intendedUseHeading.waitFor({ state: "visible", timeout: 10000 });

    // Scroll to the Intended Use section
    await intendedUseHeading.scrollIntoViewIfNeeded();

    // Click the first radio button (admin purpose) using the ID
    const intendedUseRadio = page.locator("input#purposeAndUseAdmin");
    await intendedUseRadio.scrollIntoViewIfNeeded();
    await intendedUseRadio.waitFor({ state: "visible", timeout: 5000 });
    await intendedUseRadio.check({ force: true });
    await page.waitForTimeout(1000); // Auto-save delay

    // Navigate to publish page
    await page.goto(`/en/form-builder/${formId}/publish`);

    // Click the Publish button to open the dialog
    const publishButton = page.getByRole("main").getByRole("button", { name: /publish/i });
    await expect(publishButton).toBeVisible();
    await publishButton.click();

    // Fill in the "Publish form"
    const publishDialog = page.getByRole("heading", { name: "Publish form" });
    await expect(publishDialog).toBeVisible();

    // Select a reason for publishing (first radio button)
    const reasonRadio = page.locator('input[type="radio"]').first();
    await reasonRadio.click();

    // Click Continue to publish
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForLoadState("networkidle");

    // Fill in "Tell us more about your form"
    const tellUsMoreDialog = page.getByRole("heading", {
      name: "Tell us more about your form",
    });

    await expect(tellUsMoreDialog).toBeVisible();

    // Select type of form
    const typeSelect = page.locator("select").first();
    await typeSelect.selectOption({ index: 1 });

    // Fill in description
    const descriptionTextarea = page.locator("textarea").first();
    await descriptionTextarea.fill("Test form description");

    // Click Continue and wait for the published page redirect
    await Promise.all([
      page.waitForURL(new RegExp(`/form-builder/${formId}/published`), {
        timeout: 60000,
      }),
      page.getByRole("button", { name: "Continue" }).click(),
    ]);

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(new RegExp(`/form-builder/${formId}/published`));
    await expect(page.getByRole("heading", { name: "Your form is published" })).toBeVisible();
  });
});
