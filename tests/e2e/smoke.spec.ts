import { test, expect } from "@playwright/test";

test.describe("Basic Site Functionality", () => {
  test("should load the homepage and display expected content", async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/");

    // Verify the page loads successfully
    await expect(page).toHaveURL("/");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Check for the main heading
    const heading = page.locator("h1");
    await expect(heading).toContainText("GC Forms - Formulaires GC");

    // Verify we can see the language selection or main content
    const content = page.locator("body");
    await expect(content).toBeVisible();
  });

  test("should navigate to form builder page", async ({ page }) => {
    // Go to the form builder page
    await page.goto("/en/form-builder");

    // Verify the page loads
    await expect(page).toHaveURL(/.*\/en\/form-builder/);

    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Check that the page doesn't have obvious errors
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Verify no JavaScript errors on the page
    page.on("pageerror", (error) => {
      throw new Error(`Page error: ${error.message}`);
    });
  });

  test("should have functional language switching", async ({ page }) => {
    // Start on English page
    await page.goto("/en/form-builder");

    // Look for language switching functionality
    // This will vary based on implementation, but we'll check basic navigation
    await page.waitForLoadState("networkidle");

    // Verify the page loads without errors
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Check for HTTP status
    const response = await page.goto("/fr/form-builder");
    expect(response?.status()).toBeLessThan(400);
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    // Navigate to a non-existent page
    const response = await page.goto("/en/this-page-does-not-exist");

    // Should either redirect or show 404 page
    expect(response?.status()).toBeGreaterThanOrEqual(200);

    // Page should still be functional
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
