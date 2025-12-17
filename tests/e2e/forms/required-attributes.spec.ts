import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("Testing a basic frontend form", () => {
  let publishedFormPath: string;
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    // Create a published template directly in the database
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({
      fixtureName: "requiredAttributesTestForm",
      published: true,
    });
    publishedFormPath = `en/id/${formId}`;
  });

  test.afterAll(async () => {
    // Clean up: delete the template and disconnect
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
    await dbHelper.disconnect();
  });

  test("Renders properly", async ({ page }) => {
    await page.goto(publishedFormPath);

    // Check that the attestation text is displayed
    await expect(page.locator("body")).toContainText("A Required Attributes Test Form");
  });

  test.describe("Required Attributes", () => {
    test("Displays errors when submitting empty form", async ({ page }) => {
      await page.goto(publishedFormPath);

      // Submit the empty form
      await page.locator("[type='submit']").click();

      // Wait for error list to appear before checking individual items
      await expect(page.locator("li").first()).toBeVisible({ timeout: 10000 });

      // Verify error messages for required fields
      await expect(page.locator("li").nth(0)).toContainText(
        "Enter an answer for: A Required Short Answer"
      );
      await expect(page.locator("li").nth(1)).toContainText(
        "Select one or multiple options for: A Required Multiple Choice"
      );
      await expect(page.locator("li").nth(2)).toContainText(
        "Enter an answer for: A Required Radio"
      );
      await expect(page.locator("li").nth(3)).toContainText(
        "Select an option for: A Required Dropdown"
      );
    });

    test("Fills required fields and submits properly", async ({ page }) => {
      await page.goto(publishedFormPath);

      // Fill in required fields
      await page.getByRole("textbox", { name: "A Required Short Answer" }).fill("Testing");
      await page.getByRole("checkbox", { name: "One" }).check({ force: true });
      await page.getByText("One").nth(1).click(); // Click the label for the radio button
      await page.getByRole("combobox", { name: "A Required Dropdown" }).selectOption("One");

      // Submit the form and wait for the success heading to appear
      await page.locator("[type='submit']").click();

      // Verify submission confirmation with extended timeout
      await expect(page.getByRole("heading", { name: "Your form has been submitted" })).toBeVisible(
        { timeout: 15000 }
      );
    });
  });
});
