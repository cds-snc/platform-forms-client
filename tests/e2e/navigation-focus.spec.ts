import { test, expect, type Page } from "@playwright/test";
import { DatabaseHelper } from "../helpers";

const fillFullName = async (page: Page) => {
  await page.getByRole("textbox", { name: "Full name" }).fill("Test User");
};

test.describe("Forms Navigation Focus", { tag: "@published-form" }, () => {
  let publishedFormPath: string;
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({ fixtureName: "navigationFocus", published: true });
    publishedFormPath = `en/id/${formId}`;
  });

  test.afterAll(async () => {
    // Clean up: delete the template and disconnect
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
  });

  test.describe("Focus should remain on the error container when there are validation errors", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(publishedFormPath);
    });

    test("Focus error validation correctly", async ({ page }) => {
      await fillFullName(page);

      // focus the next button and click to trigger validation errors without filling out any fields
      await page.locator("button[data-testid='nextButton']").focus();
      await page.locator("button[data-testid='nextButton']").click();

      // add delay to ensure any focus changes have occurred after clicking the next button
      await page.waitForTimeout(500);

      await expect(page.locator("#gc-form-errors")).toBeVisible();
      const focusedElement = await page.evaluate(() => document.activeElement?.id);
      expect(focusedElement).toBe("gc-form-errors");
    });
  });

  test.describe("Focus is on the correct heading when navigating or in an error state", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(publishedFormPath);
    });

    test("H1 should not be focussed on the initial Start page load", async ({ page }) => {
      await page.evaluate(() => document.activeElement);
      const h1Text = await page.locator("h1").textContent();

      expect(h1Text).toContain("Navigation Focus");
      const h1 = await page.locator("h1").elementHandle();
      const isFocused = await page.evaluate((el) => el === document.activeElement, h1);
      expect(isFocused).toBeFalsy();
    });

    test("Focus should be on H2 on navigating to a 'sub page'", async ({ page }) => {
      await fillFullName(page);

      // focus the radio button input
      await page.locator('[id="1.0"]').focus();
      await page.locator('[id="1.0"]').press("Space");
      await page.locator("button[data-testid='nextButton']").click();
      await page.waitForTimeout(500);

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe("H2");
    });

    test("Focusses H1 on navigating back to the Start page", async ({ page }) => {
      await fillFullName(page);

      // make sure the radio is visible and clickable before clicking to avoid a potential Playwright click interception error that can cause the test to fail before it reaches the focus assertion
      await expect(page.locator("label[for='1.0']")).toBeVisible();

      await page.locator('[id="1.0"]').focus();
      await page.locator('[id="1.0"]').press("Space");

      await page.locator("button[data-testid='nextButton']").click({ force: true });
      await page.waitForTimeout(500);
      await page.locator("button[data-testid='backButtonGroup']").click({ force: true });
      await page.waitForTimeout(500);

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe("H1");
    });

    test("Focus should be on an H2 when jumping to a sub page from the Review page", async ({
      page,
    }) => {
      await fillFullName(page);

      await page.getByRole("radio", { name: "A" }).focus();
      await page.getByRole("radio", { name: "A" }).press("Space");

      await page.locator("button[data-testid='nextButton']").click();
      await page.getByRole("textbox", { name: "QA" }).fill("test");
      await page.locator("button[data-testid='nextButton']").click();
      await expect(
        page.getByRole("heading", {
          level: 2,
          name: "Review your answers before submitting the form.",
        })
      ).toBeVisible();

      await page
        .locator("button[data-testid='editButton-bd4c615d-fef5-4a38-b1f0-c73954803867']")
        .first()
        .click({ force: true });

      await page.waitForTimeout(500);

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe("H2");
    });

    test("Focus should be on an H1 when jumping back to the Start page from the Review page", async ({
      page,
    }) => {
      await fillFullName(page);

      // Select branch A
      await page.locator('[id="1.0"]').focus();
      await page.locator('[id="1.0"]').press("Space"); // Ensure radio is checked
      await page.locator("button[data-testid='nextButton']").click(); // Go to sub page A

      await page.fill("input[id='2']", "test"); // Avoid a validation error
      await page.locator("button[data-testid='nextButton']").click(); // Go to Review page

      await page.locator("button[data-testid='editButton-start']").first().click(); // Go back to the Start page

      await page.waitForTimeout(500);

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe("H1");
    });
  });
});
