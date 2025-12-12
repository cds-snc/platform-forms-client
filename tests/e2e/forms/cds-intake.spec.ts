import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("CDS Intake Form", () => {
  let publishedFormPath: string;
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    // Create a published template directly in the database
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createPublishedTemplate("requiredAttributesTestForm");
    publishedFormPath = `en/id/${formId}`;
  });

  test.afterAll(async () => {
    // Clean up: delete the template and disconnect
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
    await dbHelper.disconnect();
  });

  test("should load CDS intake form and display title", async ({ page }) => {
    await page.goto(publishedFormPath);

    // The form should be loaded at this point
    // Look for the specific form title
    await expect(page.getByRole("heading", { name: "CDS Intake Form" })).toBeVisible();

    // Check for form elements specific to CDS intake
    await expect(page.locator("form")).toBeVisible();
  });

  test("should be able to interact with form fields", async ({ page }) => {
    await page.goto(publishedFormPath);

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
