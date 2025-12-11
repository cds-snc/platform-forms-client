import { test, expect } from "@playwright/test";
import { FormUploadHelper } from "../helpers/form-upload-helper";
import { userSession } from "../helpers/user-session";

test.describe("Forms Functionality - Character Counts", () => {
  let publishedPath: string;

  test.beforeAll(async ({ browser }) => {
    // Set a longer timeout for the beforeAll hook since publishing takes time
    test.setTimeout(120000);

    // Create a new page for setup
    const context = await browser.newContext();
    const page = await context.newPage();

    // Authenticate and publish the form once
    await userSession(page);
    const formHelper = new FormUploadHelper(page);
    const formId = await formHelper.uploadFormFixture("textFieldTestForm");
    await formHelper.publishForm(formId);
    publishedPath = `en/id/${formId}`;

    // Clean up
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(publishedPath);
  });

  test("does not display any message when not enough characters have been typed in", async ({
    page,
  }) => {
    await page.fill("input[id='2']", "This is 21 characters");
    await expect(page.locator("div[id='characterCountMessage2']")).toBeHidden();
    const text = await page.locator("div[id='characterCountMessage2']").textContent();
    expect(text).toBe("");
  });

  test("displays a message with the number of characters remaining", async ({ page }) => {
    await page.fill("input[id='2']", "This is 35 characters This is 35 ch");
    await expect(page.locator("div[id='characterCountMessage2']")).toBeVisible();
    await expect(page.locator("div[id='characterCountMessage2']")).toContainText(
      "You have 5 characters left."
    );
  });

  test("displays an error message indicating too many characters", async ({ page }) => {
    await page.fill("input[id='2']", "This is 48 characters This is 48 characters This");
    await expect(page.locator("div[id='characterCountMessage2']")).toBeVisible();
    await expect(page.locator("div[id='characterCountMessage2']")).toContainText(
      "exceeded the limit"
    );
  });

  test("won't submit the form if the number of characters is too many", async ({ page }) => {
    await page.fill("input[id='2']", "This is too many characters. This is too many characters.");
    await page.locator("[type='submit']").click();

    await expect(page.getByRole("heading", { name: /Please correct the errors on/ })).toBeVisible();
  });
});
