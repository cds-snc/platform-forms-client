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

  test("shows dependent field when choice selected", async ({ page }) => {
    await page.goto(publishedFormPath);

    // The dependent text field "More" (id 2) should be hidden until choice 1.1 (B) is selected
    const dependentField = page.getByRole("textbox", { name: "More" });
    await expect(dependentField).toBeHidden();

    // Select the radio choice that triggers the conditional rule by accessible name
    await page.getByRole("radio", { name: "b" }).check();

    // Now the dependent field should be visible
    await expect(dependentField).toBeVisible({ timeout: 5000 });
  });
});
