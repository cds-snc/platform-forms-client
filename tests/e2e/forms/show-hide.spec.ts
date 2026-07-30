import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("Show/Hide conditional logic", { tag: "@published-form" }, () => {
  let dbHelper: DatabaseHelper;
  let formId: string;
  let publishedFormPath: string;

  test.beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({
      fixtureName: "showHideTest",
      published: true,
    });
    publishedFormPath = `en/id/${formId}`;
  });

  test.afterAll(async () => {
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
  });

  test("dependent field is hidden on initial load", async ({ page }) => {
    await page.goto(publishedFormPath);

    const dependentField = page.getByRole("textbox", { name: "More" });
    await expect(dependentField).toBeHidden();
  });

  test("shows dependent field when triggering choice is selected", async ({ page }) => {
    await page.goto(publishedFormPath);

    const dependentField = page.getByRole("textbox", { name: "More" });
    await expect(dependentField).toBeHidden();

    await page.locator('label[for="1.1"]').click();

    await expect(dependentField).toBeVisible({ timeout: 5000 });
  });

  test("hides dependent field again when triggering choice is deselected", async ({ page }) => {
    await page.goto(publishedFormPath);

    const dependentField = page.getByRole("textbox", { name: "More" });

    // Show it
    await page.locator('label[for="1.1"]').click();
    await expect(dependentField).toBeVisible({ timeout: 5000 });

    // Switch to the non-triggering choice — dependent field should disappear
    await page.locator('label[for="1.0"]').click();
    await expect(dependentField).toBeHidden({ timeout: 5000 });
  });

  test("non-triggering choice does not show dependent field", async ({ page }) => {
    await page.goto(publishedFormPath);

    const dependentField = page.getByRole("textbox", { name: "More" });
    await page.locator('label[for="1.0"]').click();

    await expect(dependentField).toBeHidden();
  });

  test("show/hide works on page 2 after navigating from page 1", async ({ page }) => {
    await page.goto(publishedFormPath);

    // Navigate past page 1 without triggering any conditionals
    await page.getByTestId("nextButton").click();

    // On page 2: dependent field should be hidden before any selection
    const dependentField = page.getByRole("textbox", { name: "Previous application details" });
    await expect(dependentField).toBeHidden();

    // Select the triggering choice (Yes)
    await page.locator('label[for="3.0"]').click();
    await expect(dependentField).toBeVisible({ timeout: 5000 });

    // Switch to non-triggering choice (No) — should hide again
    await page.locator('label[for="3.1"]').click();
    await expect(dependentField).toBeHidden({ timeout: 5000 });
  });
});
