import { test, expect } from "@playwright/test";
import { FormUploadHelper } from "../helpers/form-upload-helper";

test.describe("CDS Intake Form", () => {
  test("should load CDS intake form and display title", async ({ page }) => {
    const formHelper = new FormUploadHelper(page);

    // Upload the form fixture - this will automatically navigate to preview
    await formHelper.uploadFormFixture("cdsIntakeTestForm");

    // The form should be loaded at this point
    // Look for the specific form title
    await expect(page.getByRole("heading", { name: "CDS Intake Form" })).toBeVisible();

    // Check for form elements specific to CDS intake
    await expect(page.locator("form")).toBeVisible();
  });

  test("should be able to interact with form fields", async ({ page }) => {
    const formHelper = new FormUploadHelper(page);

    // Upload the form fixture - this will automatically navigate to preview
    await formHelper.uploadFormFixture("cdsIntakeTestForm");

    // Look for common form elements that might be in the CDS intake form
    const formElements = page.locator('input, textarea, select, button[type="submit"]');
    const count = await formElements.count();

    expect(count).toBeGreaterThan(0);

    // Test interaction with a specific field (full name field)
    const nameField = page.getByLabel(/What is your full name/i);
    if (await nameField.isVisible()) {
      await nameField.fill("Test User");
      await expect(nameField).toHaveValue("Test User");
    }
  });
});
