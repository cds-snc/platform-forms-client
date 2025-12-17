import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("Testing a basic frontend form", () => {
  let publishedFormPath: string;
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    // Create a published template directly in the database
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({ fixtureName: "textFieldTestForm", published: true });
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
    await expect(page.locator("body")).toContainText("Text Field Test Form");
  });

  test.describe("Character Limits", () => {
    test("does not display any message when not enough characters have been typed in", async ({
      page,
    }) => {
      await page.goto(publishedFormPath);
      await page.getByRole("textbox", { name: "Text Field 1" }).fill("This is 21 characters");
      await expect(page.locator("#characterCountMessage2")).toBeHidden();
      const text = await page.locator("#characterCountMessage2").textContent();
      expect(text).toBe("");
    });

    test("displays a message with the number of characters remaining", async ({ page }) => {
      await page.goto(publishedFormPath);
      await page
        .getByRole("textbox", { name: "Text Field 1" })
        .fill("This is 35 characters This is 35 ch");

      // Wait for the character count message to appear (it may be debounced)
      const characterMessage = page.locator("#characterCountMessage2");
      await expect(characterMessage).toBeVisible({ timeout: 10000 });
      await expect(characterMessage).toContainText("You have 5 characters left.");
    });

    test("displays an error message indicating too many characters", async ({ page }) => {
      await page.goto(publishedFormPath);
      const textInput = page.getByRole("textbox", { name: "Text Field 1" });

      // Type text exceeding limit and blur to trigger onChange
      await textInput.fill("This is 48 characters This is 48 characters This");
      await textInput.blur();

      const characterMessage = page.locator("#characterCountMessage2");
      await expect(characterMessage).toBeVisible();
      await expect(characterMessage).toContainText("exceeded the limit");
    });

    test("won't submit the form if the number of characters is too many", async ({ page }) => {
      await page.goto(publishedFormPath);
      await page
        .getByRole("textbox", { name: "Text Field 1" })
        .fill("This is too many characters. This is too many characters.")
        .then(async () => {
          page.locator("[type='submit']").click();

          await expect(
            page.getByRole("heading", { name: /Please correct the errors on/ })
          ).toBeVisible();
        });
    });
  });
});
