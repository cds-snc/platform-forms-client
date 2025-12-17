import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("Testing attestation fields", () => {
  let publishedFormPath: string;
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    // Create a published template directly in the database
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({ fixtureName: "attestationTestForm", published: true });
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
    await expect(page.locator("h1")).toContainText("An Attestation Test Form");
  });

  test.describe("Attestation field checks", () => {
    test("Attestation content", async ({ page }) => {
      await page.goto(publishedFormPath);

      await page.getByRole("group", { name: "I agree to: all checkboxes" }).isVisible();
    });

    test("Displays error when submitting form without checking all boxes", async ({ page }) => {
      await page.goto(publishedFormPath);

      // Submit without checking any boxes
      await page.locator("[type='submit']").click();

      // Wait for error list to appear using ordered list selector with extended timeout
      await expect(page.locator(".gc-ordered-list li").first()).toBeVisible({ timeout: 10000 });

      // Verify error messages
      await expect(page.locator("li")).toContainText("Check off all the boxes for");
      await expect(page.getByTestId("errorMessage")).toContainText(
        "Read and check all boxes to confirm the items in this section."
      );

      await page.locator("label").filter({ hasText: "Condition 1" }).click();

      // Submit the form
      await page.locator("[type='submit']").click();

      // Verify error messages
      await expect(page.locator("li")).toContainText("Check off all the boxes for");
      await expect(page.getByTestId("errorMessage")).toContainText(
        "Read and check all boxes to confirm the items in this section."
      );
    });

    test("Submits properly", async ({ page }) => {
      await page.goto(publishedFormPath);

      // Click both checkboxes
      await page.locator("label").filter({ hasText: "Condition 1" }).click();
      await page.locator("label").filter({ hasText: "Condition 2" }).click();
      await page.locator("label").filter({ hasText: "Condition 3" }).click();

      // Submit the form
      await page.locator("[type='submit']").click();

      // Verify submission confirmation with extended timeout
      await expect(page.getByRole("heading", { name: "Your form has been submitted" })).toBeVisible(
        { timeout: 15000 }
      );
    });
  });
});
