import { test, expect, Page } from "@playwright/test";

test.describe("Form builder names and titles", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("/en/form-builder/0000/edit");
  });

  test("Autocompletes name with title on focus", async ({ page }) => {
    const input = page.locator("#formTitle");
    await expect(input).toBeEditable();
    await input.click();
    await expect(input).toBeFocused();
    await input.pressSequentially("Playwright Share Test Form", { delay: 200 });
    await expect(input).toHaveValue("Playwright Share Test Form");
    await page.click("#fileName");
    await expect(page.locator("#fileName")).toHaveValue("Playwright Share Test Form");
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
