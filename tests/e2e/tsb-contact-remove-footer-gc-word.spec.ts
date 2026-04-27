import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../helpers";

test.describe("TSB Contact Form functionality", () => {
  let publishedFormPath: string;
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    // Create a published template directly in the database
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({
      fixtureName: "tsbDisableFooterGCBranding",
      published: true,
    });
    publishedFormPath = `en/id/${formId}`;
  });

  test.afterAll(async () => {
    // Clean up: delete the template and disconnect
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
  });

  test("Form footer does not contain GC branding", async ({ page }) => {
    await page.goto(publishedFormPath);

    // Check that the form title is displayed
    await expect(
      page.getByRole("heading", { name: "Transportation Safety Board of Canada general enquiries" })
    ).toBeVisible();

    // Visit the published form in English

    // Verify that the footer does not contain the GC wordmark image
    // When disableGcBranding is true, the GC wordmark should not be present
    const gcWordmark = page
      .locator("[data-testid='footer']")
      .locator(
        "img[alt*='Government of Canada'], img[alt*='Gouvernement du Canada'], img[src*='sig-blk']"
      );
    await expect(gcWordmark).toHaveCount(0);
  });
});
