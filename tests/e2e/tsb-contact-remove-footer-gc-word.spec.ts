import { test, expect } from "@playwright/test";
import { FormUploadHelper } from "../helpers/form-upload-helper";

test.describe("TSB Contact Form functionality", () => {
  test("TSB Contact Form renders", async ({ page }) => {
    const formHelper = new FormUploadHelper(page);

    // Upload the form fixture - this will automatically navigate to preview
    await formHelper.uploadFormFixture("tsbDisableFooterGCBranding");

    // Check that the form title is displayed
    await expect(
      page.getByRole("heading", { name: "Transportation Safety Board of Canada general enquiries" })
    ).toBeVisible();
  });

  test("Form footer does not contain GC branding", async ({ page }) => {
    const formHelper = new FormUploadHelper(page);

    // Upload the form fixture - this will automatically navigate to preview
    await formHelper.uploadFormFixture("tsbDisableFooterGCBranding");

    // Verify that the footer does not contain any images (GC branding)
    const footerImages = page.locator("[data-testid='footer']").locator("img");
    await expect(footerImages).toHaveCount(0);
  });
});
