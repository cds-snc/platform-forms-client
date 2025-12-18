import { test, expect, Page } from "@playwright/test";

test.describe("Form builder names and titles", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/en/form-builder/0000/edit");
  });

  test("Autocompletes name with title on focus", async ({ page }) => {
    await page.fill("#formTitle", "Playwright Share Test Form");
    await page.waitForTimeout(500);

    await page.focus("#fileName");
    // Clicking back to title to trigger potential blur/focus behavior
    await page.click("#formTitle");
    const value = await page.locator("#fileName").inputValue();
    expect(value).toBe("Playwright Share Test Form");
  });

  test("Accepts a blank name", async ({ page }) => {
    await page.fill("#formTitle", "Playwright Share Test Form");
    await page.waitForTimeout(500);

    await page.click("#fileName");
    await page.locator("#fileName").fill("");
    const value = await page.locator("#fileName").inputValue();
    expect(value).toBe("");
  });
});
