import { test, expect } from "@playwright/test";

test.describe("User profile", () => {
  test.describe("Regular User", () => {
    test("Can navigate to Profile page", async ({ page }) => {
      await page.goto("/en/forms");
      await page.waitForLoadState("networkidle");

      // Click the account dropdown button and wait for dropdown to appear
      await page.locator("button[id^='radix-']").click();
      await page.waitForSelector("[data-testid='yourAccountDropdownContent']", {
        state: "visible",
      });

      // Click Profile in the dropdown
      await page.locator("[data-testid='yourAccountDropdownContent']").getByText("Profile").click();

      // Verify navigation to profile page
      await expect(page).toHaveURL(/\/profile/);
      await expect(page.getByRole("heading", { name: "Profile", level: 1 })).toBeVisible();

      // Verify sections are present
      const headings = page.locator("h2");
      await expect(headings.nth(1)).toContainText("Account information");
      await expect(headings.nth(2)).toContainText("Security questions");
    });

    test("Redirects to user profile page if security questions are already completed", async ({
      page,
    }) => {
      await page.goto("/en/auth/setup-security-questions");

      // Should redirect to profile page
      await expect(page).toHaveURL(/\/en\/profile/);
      await expect(page.getByRole("heading", { name: "Profile", level: 1 })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Security questions" })).toBeVisible();
    });

    test("Renders the My Account dropdown as non-admin", async ({ page }) => {
      await page.goto("/en/forms");

      // Dropdown should not be visible initially
      await expect(page.locator("[data-testid='yourAccountDropdownContent']")).not.toBeVisible();

      // Click to open dropdown
      await page.locator("button[id^='radix-']").click();

      // Verify dropdown contents
      const dropdown = page.locator("[data-testid='yourAccountDropdownContent']");
      await expect(dropdown).toBeVisible();
      await expect(dropdown).toContainText("Profile");
      await expect(dropdown).toContainText("Sign out");
      await expect(dropdown).not.toContainText("Administration");
    });
  });

  test.describe("Admin User", () => {
    test.use({ storageState: "tests/.auth/user-admin.json" });

    test("Can navigate to Profile page", async ({ page }) => {
      await page.goto("/en/forms");
      await page.waitForLoadState("networkidle");

      // Click the account dropdown button and wait for dropdown to appear
      await page.locator("button[id^='radix-']").click();
      await page.waitForSelector("[data-testid='yourAccountDropdownContent']", {
        state: "visible",
      });

      // Click Profile in the dropdown
      await page.locator("[data-testid='yourAccountDropdownContent']").getByText("Profile").click();

      // Verify navigation to profile page
      await expect(page).toHaveURL(/\/profile/);
      await expect(page.getByRole("heading", { name: "Profile", level: 1 })).toBeVisible();

      // Verify sections are present
      const headings = page.locator("h2");
      await expect(headings.nth(1)).toContainText("Account information");
      await expect(headings.nth(2)).toContainText("Security questions");
    });

    test("Renders the My Account dropdown as admin", async ({ page }) => {
      await page.goto("/en/forms");

      // Dropdown should not be visible initially
      await expect(page.locator("[data-testid='yourAccountDropdownContent']")).not.toBeVisible();

      // Click to open dropdown
      await page.locator("button[id^='radix-']").click();

      // Verify dropdown contents including admin link
      const dropdown = page.locator("[data-testid='yourAccountDropdownContent']");
      await expect(dropdown).toBeVisible();
      await expect(dropdown).toContainText("Profile");
      await expect(dropdown).toContainText("Sign out");
      await expect(dropdown).toContainText("Administration");
    });
  });
});
