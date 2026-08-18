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

  test("hides dependent field when triggering choice is replaced", async ({ page }) => {
    await page.goto(publishedFormPath);

    const dependentField = page.getByRole("textbox", { name: "More" });
    await page.locator('label[for="1.1"]').click();
    await expect(dependentField).toBeVisible({ timeout: 5000 });

    await page.locator('label[for="1.0"]').click();

    await expect(dependentField).toBeHidden({ timeout: 5000 });
  });

  test("non-triggering choice does not show dependent field", async ({ page }) => {
    await page.goto(publishedFormPath);

    const dependentField = page.getByRole("textbox", { name: "More" });
    await page.locator('label[for="1.0"]').click();

    await expect(dependentField).toBeHidden({ timeout: 5000 });
  });

  test("preserves show/hide behavior after navigating to another group", async ({ page }) => {
    await page.goto(publishedFormPath);
    await page.getByTestId("nextButton").click();

    const dependentField = page.getByRole("textbox", { name: "Previous application details" });
    await expect(dependentField).toBeHidden();

    await page.locator('label[for="3.0"]').click();
    await expect(dependentField).toBeVisible({ timeout: 5000 });

    await page.locator('label[for="3.1"]').click();
    await expect(dependentField).toBeHidden({ timeout: 5000 });
  });
});
