import { test, expect, type Locator } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

const setCheckboxValue = async (locator: Locator, checked: boolean) => {
  if ((await locator.isChecked()) === checked) {
    return;
  }

  await locator.focus();
  await locator.press("Space");
};

test.describe("Testing attestation fields", { tag: "@published-form" }, () => {
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
  });

  test("Renders properly", async ({ page }) => {
    await page.goto(publishedFormPath);

    // Check that the attestation text is displayed
    await expect(page.locator("h1")).toContainText("An Attestation Test Form");
  });

  test.describe("Attestation field checks", () => {
    test("Attestation content", async ({ page }) => {
      await page.goto(publishedFormPath);

      await expect(page.getByRole("group", { name: /I agree to:/ })).toBeVisible();
    });

    test("Displays error when submitting form without checking all boxes", async ({ page }) => {
      await page.goto(publishedFormPath);
      const condition1Checkbox = page.locator('[id="1.0"]');
      const errorMessage = page.getByTestId("errorMessage");

      // Submit without checking any boxes
      await page.getByRole("button", { name: "Submit" }).click({ force: true });
      await page.waitForTimeout(500);

      await expect(errorMessage).toBeVisible();

      // Verify error messages
      await expect(errorMessage).toContainText(
        "Read and check all boxes to confirm the items in this section."
      );

      await setCheckboxValue(condition1Checkbox, true);
      await expect(condition1Checkbox).toBeChecked();

      // Submit the form
      await page.getByRole("button", { name: "Submit" }).click();

      // Verify error messages
      await expect(errorMessage).toContainText(
        "Read and check all boxes to confirm the items in this section."
      );
    });

    test("Submits properly", async ({ page }) => {
      await page.goto(publishedFormPath);
      const condition1Checkbox = page.locator('[id="1.0"]');
      const condition2Checkbox = page.locator('[id="1.1"]');
      const condition3Checkbox = page.locator('[id="1.2"]');

      // Click both checkboxes
      await setCheckboxValue(condition1Checkbox, true);
      await setCheckboxValue(condition2Checkbox, true);
      await setCheckboxValue(condition3Checkbox, true);

      await expect(condition1Checkbox).toBeChecked();
      await expect(condition2Checkbox).toBeChecked();
      await expect(condition3Checkbox).toBeChecked();

      await page.getByRole("button", { name: "Submit" }).click();

      // Verify inline submission confirmation
      await expect(page.getByRole("heading", { name: "Your form has been submitted" })).toBeVisible(
        { timeout: 15000 }
      );
    });
  });
});
