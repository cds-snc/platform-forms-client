import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../helpers";

test.describe("Forms Navigation Focus", () => {
  let publishedFormPath: string;
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({ fixtureName: "navigationFocus", published: true });
    publishedFormPath = `en/id/${formId}`;
  });

  test.describe("Focus should remain on the error container when there are validation errors", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(publishedFormPath);
    });

    test("Focus error validation correctly", async ({ page }) => {
      await page.locator("label[for='1.0']").click();
      await page.locator("button[data-testid='nextButton']").click();
      await page.locator("button[data-testid='nextButton']").click(); // Trigger validation error

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
      await page.locator("label[for='1.0']").click();
      await page.locator("button[data-testid='nextButton']").click();

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe("H2");
    });

    test("Focusses H1 on navigating back to the Start page", async ({ page }) => {
      await page.locator("label[for='1.0']").click();
      await page.locator("button[data-testid='nextButton']").click();
      await page.locator("button[data-testid='backButtonGroup']").click();

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe("H1");
    });

    test("Focus should be on an H2 when jumping to a sub page from the Review page", async ({
      page,
    }) => {
      await page.locator("label[for='1.0']").click(); // Select branch A
      await page.locator("button[data-testid='nextButton']").click(); // Go to sub page A

      await page.fill("input[id='2']", "test"); // Avoid a validation error
      await page.locator("button[data-testid='nextButton']").click(); // Go to Review page

      await page
        .locator("button[data-testid='editButton-bd4c615d-fef5-4a38-b1f0-c73954803867']")
        .first()
        .click(); // Go back to sub page A

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe("H2");
    });

    test("Focus should be on an H1 when jumping back to the Start page from the Review page", async ({
      page,
    }) => {
      await page.locator("label[for='1.0']").click(); // Select branch A
      await page.locator("button[data-testid='nextButton']").click(); // Go to sub page A

      await page.fill("input[id='2']", "test"); // Avoid a validation error
      await page.locator("button[data-testid='nextButton']").click(); // Go to Review page

      await page.locator("button[data-testid='editButton-start']").first().click(); // Go back to the Start page

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe("H1");
    });
  });
});
