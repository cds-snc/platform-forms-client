import { test, expect } from "@playwright/test";

test.describe("Terms and Conditions Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/terms-and-conditions");
  });

  test("Get page content", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Terms and conditions", level: 1 })
    ).toBeVisible();
  });

  test("Change page language to French", async ({ page }) => {
    // Click the French language link
    await page.locator("a[lang='fr']").click();

    // Verify URL changed to French
    await expect(page).toHaveURL(/\/fr/);

    // Verify French heading is displayed
    await expect(
      page.getByRole("heading", { name: "Conditions générales", level: 1 })
    ).toBeVisible();
  });
});
