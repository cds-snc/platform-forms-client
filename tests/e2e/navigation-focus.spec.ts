import { test, expect } from "@playwright/test";
import { FormUploadHelper } from "../helpers/form-upload-helper";

test.describe("Forms Navigation Focus", () => {
  let uploadHelper: FormUploadHelper;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    uploadHelper = new FormUploadHelper(page);
    await uploadHelper.uploadFormFixture("navigationFocus");
    await page.close();
  });

  // Keep this isolated. Focus tests can be sensitive to previous interactions
  test.describe("Focus should remain on the error container when there are validation errors", () => {
    test.beforeEach(async ({ page }) => {
      uploadHelper = new FormUploadHelper(page);
      await uploadHelper.visitForm();
    });

    test("Focus error validation correctly", async ({ page }) => {
      await page.getByLabel("1.0").click();
      await page.getByTestId("nextButton").click();
      await page.getByTestId("nextButton").click(); // Trigger validation error

      // Check that focus is on the error container
      await expect(page.locator("#gc-form-errors")).toBeFocused();
    });
  });

  test.describe("Focus is on the correct heading when navigating or in an error state", () => {
    test.beforeEach(async ({ page }) => {
      uploadHelper = new FormUploadHelper(page);
      await uploadHelper.visitForm();
    });

    test("H1 should not be focussed on the initial Start page load", async ({ page }) => {
      await expect(
        page.getByRole("heading", { level: 1, name: "Navigation Focus" })
      ).not.toBeFocused();
    });

    test("Focus should be on H2 on navigating to a sub page", async ({ page }) => {
      await page.getByLabel("1.0").click();
      await page.getByTestId("nextButton").click();
      await expect(page.locator("form h2")).toBeFocused();
    });

    test("Focusses H1 on navigating back to the Start page", async ({ page }) => {
      await page.getByLabel("1.0").click();
      await page.getByTestId("nextButton").click();
      await page.getByTestId("backButtonGroup").click();

      await expect(page.getByRole("heading", { level: 1, name: "Navigation Focus" })).toBeFocused();
    });

    test("Focus should be on the Review page heading", async ({ page }) => {
      // Fill out the form to reach review
      await page.getByLabel("1.0").click();
      await page.getByTestId("nextButton").click();

      // Fill any required fields on subsequent pages
      await page.getByTestId("nextButton").click();

      // Should be on review page with focus on heading
      await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    });

    test("Focus should return to error field when correcting validation errors", async ({
      page,
    }) => {
      await page.getByLabel("1.0").click();
      await page.getByTestId("nextButton").click();
      await page.getByTestId("nextButton").click(); // Trigger validation error

      // Verify error container has focus
      await expect(page.locator("#gc-form-errors")).toBeFocused();

      // Click on an error link to go to the field
      await page.locator("#gc-form-errors a").first().click();

      // Focus should now be on the input field
      await expect(page.locator('input[type="radio"]:first-of-type')).toBeFocused();
    });
  });
});
