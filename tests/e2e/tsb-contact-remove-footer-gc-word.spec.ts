import { test, expect } from "@playwright/test";
import { FormUploadHelper } from "../helpers/form-upload-helper";
import { userSession } from "../helpers/user-session";

test.describe("TSB Contact Form functionality", () => {
  test("Form footer does not contain GC branding", async ({ page }) => {
    // Increase timeout for this test as publishing can take a while
    test.setTimeout(40000);

    await userSession(page);

    const formHelper = new FormUploadHelper(page);

    // Upload the form fixture
    const formId = await formHelper.uploadFormFixture("tsbDisableFooterGCBranding");

    // Publish the form
    await formHelper.publishForm(formId);

    await page.goto(`en/id/${formId}`);

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
