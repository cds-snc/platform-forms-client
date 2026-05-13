import { test, expect } from "@playwright/test";

test.describe("Form builder share", () => {
  test.describe("Authenticated", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/en/form-builder/0000/edit");
      await page.waitForLoadState("networkidle");
    });

    test("Renders share flyout with name check", async ({ page }) => {
      await page.getByRole("button", { name: "Share" }).click();
      const missingNameMessage = page.locator("#share-name-required-message");
      await expect(missingNameMessage).toContainText("You must");
      await expect(missingNameMessage).toContainText("name your form");

      await missingNameMessage.getByRole("button", { name: /name your form/i }).click();
      await expect(page.locator(":focus")).toHaveAttribute("id", "fileName");
    });

    test("Renders share via email for authenticated users (no edit ,lock feature flag)", async ({
      page,
    }) => {
      await expect(page.locator("#fileName")).toHaveAttribute("placeholder", "Unnamed form file");

      await page.fill("#fileName", "Cypress Share Test Form");
      await expect(page.locator("#fileName")).toHaveValue("Cypress Share Test Form");

      await page.getByRole("button", { name: "Share" }).click();
      await expect(page.locator("dialog label")).toContainText("Email address");

      await page.getByTestId("close-dialog").click();
    });
  });

  test.describe("UnAuthenticated", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await page.goto("/en/form-builder/0000/edit");
      await page.waitForLoadState("networkidle");
    });

    test("Renders share flyout for unAuthenticated", async ({ page }) => {
      await expect(page.locator("#fileName")).toHaveAttribute("placeholder", "Unnamed form file");
      await page.locator("#fileName").fill("Cypress Share Test Form");

      await page.getByRole("button", { name: "Share" }).click();

      // Using toBeAttached instead of "exist" check
      await expect(page.locator("dialog").filter({ hasText: "Step 1" })).toBeAttached();
      await expect(page.getByRole("button", { name: "Download form file" })).toBeAttached();
      await expect(page.getByRole("button", { name: "Copy instructions" })).toBeAttached();

      const previewSummary = page
        .locator("summary")
        .filter({ hasText: "See a preview of the email message" });
      await expect(previewSummary).toBeAttached();
      await previewSummary.click();

      await expect(page.getByRole("heading", { level: 4 }).first()).toContainText(
        "A GC Forms user has shared a form with you on GC Forms"
      );

      await page.getByTestId("close-dialog").click();
    });
  });
});
