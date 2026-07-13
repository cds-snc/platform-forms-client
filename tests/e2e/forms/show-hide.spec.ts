import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("Show/Hide conditional logic", { tag: "@published-form" }, () => {
  let dbHelper: DatabaseHelper;
  let formId: string;
  let publishedFormPath: string;

  test.beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({
      fixtureName: "filterValuesByShownElements",
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

    // The dependent text field "P1-Q1-A" (id 3) should be hidden until choice 2.0 is selected
    const dependentField = page.getByRole("textbox", { name: "P1-Q1-A" });
    await expect(dependentField).toBeHidden();

    // Select the radio choice that triggers the conditional rule (element 2 -> choice 0)
    const triggerChoice = page.locator('[id="2.0"]');
    await triggerChoice.click();

    // Now the dependent field should be visible
    await expect(dependentField).toBeVisible();
  });
});
