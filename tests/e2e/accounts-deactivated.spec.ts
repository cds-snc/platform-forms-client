import { test, expect } from "@playwright/test";

test.describe("Deactivated Page", () => {
  test("Reaches deactivated page after login", async ({ page }) => {
    await page.goto("/en/auth/login");
    await page.waitForLoadState("networkidle");
    
    await page.fill("input[id='username']", "test.deactivated@cds-snc.ca");
    await expect(page.locator("input[id='username']")).toHaveValue("test.deactivated@cds-snc.ca");
    
    await page.fill("input[id='password']", "testTesttest");
    await expect(page.locator("input[id='password']")).toHaveValue("testTesttest");
    
    await page.locator("button[type='submit']").click();

    // Deactivated screen shows
    await expect(page).toHaveURL(/\/auth\/account-deactivate/);
    await expect(page.getByRole("heading", { level: 2 })).toContainText("Account deactivated");
    await expect(page.locator("a[href='/en/support']")).toContainText("Contact support");
  });
});
