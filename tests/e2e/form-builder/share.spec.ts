import { test, expect } from "@playwright/test";
import { userSession } from "../../helpers/user-session";

test.describe("Form builder share", () => {
  test.describe("Authenticated", () => {
    test.beforeEach(async ({ page }) => {
      await userSession(page);
      await page.goto("/en/form-builder/0000/edit");
      await page.waitForLoadState("networkidle");
    });

    test("Renders share flyout with name check", async ({ page }) => {
      await page.getByRole("button", { name: "Share" }).click();

      const menuItems = page.locator("[role='menuitem']");
      await expect(menuItems).toHaveCount(1);
      await expect(menuItems).toContainText("You must");
      await expect(menuItems).toBeVisible();

      await page
        .locator("[role='menuitem'] span.underline")
        .filter({ hasText: "name your form" })
        .click();
      await expect(page.locator(":focus")).toHaveAttribute("id", "fileName");
    });

    test("Renders share flyout for authenticated", async ({ page }) => {
      await expect(page.locator("#fileName")).toHaveAttribute("placeholder", "Unnamed form file");

      await page.fill("#fileName", "Cypress Share Test Form");
      await expect(page.locator("#fileName")).toHaveValue("Cypress Share Test Form");

      await page.getByRole("button", { name: "Share" }).click();

      const menuItems = page.locator("[role='menuitem']");
      await expect(menuItems).toHaveCount(1);

      await page.locator("span").filter({ hasText: "Share by email" }).click();
      await expect(page.locator("dialog label")).toContainText("Email address");

      const previewSummary = page
        .locator("summary")
        .filter({ hasText: "See a preview of the email message" });
      await expect(previewSummary).toBeVisible();
      await previewSummary.click();

      await expect(page.getByRole("heading", { level: 4 }).first()).toContainText(
        "Regular Test User has shared a form with you on GC Forms"
      );

      await page.getByTestId("close-dialog").click();
    });
  });

  test.describe("UnAuthenticated", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/en/form-builder/0000/edit");
      await page.waitForLoadState("networkidle");
    });

    test("Renders share flyout for unAuthenticated", async ({ page }) => {
      await expect(page.locator("#fileName")).toHaveAttribute("placeholder", "Unnamed form file");
      await page.locator("#fileName").fill("Cypress Share Test Form");

      await page.getByRole("button", { name: "Share" }).click();

      const menuItems = page.locator("[role='menuitem']");
      await expect(menuItems).toHaveCount(1);

      await page.locator("span").filter({ hasText: "Share by email" }).click();

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
