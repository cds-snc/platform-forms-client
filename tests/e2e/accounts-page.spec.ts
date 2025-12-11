import { test, expect } from "@playwright/test";
import { userSession } from "../helpers/user-session";

test.describe("Accounts Page", () => {
  const adminUserEmail = "test.admin@cds-snc.ca";
  const testUserEmail = "test.user@cds-snc.ca";
  const deactivatedUserEmail = "test.deactivated@cds-snc.ca";

  test.beforeAll(async ({ browser }) => {
    // Set a longer timeout for the beforeAll hook since login and page load can take time
    test.setTimeout(120000);

    // Create a new page for setup
    const context = await browser.newContext();
    const page = await context.newPage();
    await userSession(page, { admin: true });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/admin/accounts");
    await page.waitForLoadState("networkidle");
  });

  test("Accounts page loads with title", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Accounts");
  });

  test.describe("Accounts tabs/filters and cards", () => {
    test("Clicking tabs/filters updates with expected content", async ({ page }) => {
      await page.getByRole("button", { name: "All" }).click();
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(adminUserEmail);
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(testUserEmail);
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(
        deactivatedUserEmail
      );

      await page.getByRole("button", { name: "Active" }).click();
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(adminUserEmail);
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(testUserEmail);
      await expect(
        page.locator("ul[data-testid='accountsList'] li").filter({ hasText: deactivatedUserEmail })
      ).not.toBeVisible();

      await page.getByRole("button", { name: "Deactivated" }).click();
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(
        deactivatedUserEmail
      );
      await expect(
        page.locator("ul[data-testid='accountsList'] li").filter({ hasText: adminUserEmail })
      ).not.toBeVisible();
      await expect(
        page.locator("ul[data-testid='accountsList'] li").filter({ hasText: testUserEmail })
      ).not.toBeVisible();
    });

    // Skipping for now --- until we have time to dig in on this further
    test.skip("Clicking lock/unlock publishing of an account updates the button text state", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "All" }).click();
      // Lock an account
      await page
        .locator(`li[data-testid="${testUserEmail}"]`)
        .getByRole("button", { name: "Lock publishing" })
        .click();
      await expect(page.locator(`li[data-testid="${testUserEmail}"]`)).toContainText(
        "Unlock publishing"
      );

      // Unlock an account
      await page
        .locator(`li[data-testid="${testUserEmail}"]`)
        .getByRole("button", { name: "Unlock publishing" })
        .click();
      await expect(page.locator(`li[data-testid="${testUserEmail}"]`)).toContainText(
        "Lock publishing"
      );
    });

    test("Clicking manage forms navigates to the related page", async ({ page }) => {
      await page.getByRole("button", { name: "All" }).click();
      await page
        .locator(`li[data-testid="${testUserEmail}"]`)
        .getByRole("button", { name: "Manage forms" })
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Manage forms");
    });

    // Skipping for now --- until we have time to dig in on this further
    test.skip("Account deactivation updates the card and related tabs/filters lists correctly", async ({
      page,
    }) => {
      // Deactivate the test.user and check the tab states updated correctly
      await page.getByRole("button", { name: "All" }).click();
      await page
        .locator(`li[data-testid="${testUserEmail}"]`)
        .getByRole("button", { name: "More" })
        .click();
      await page.locator("div[role='menuitem']").filter({ hasText: "Deactivate account" }).click();
      await page.locator("dialog").getByRole("button", { name: "Deactivate account" }).click();
      await expect(page.locator(`li[data-testid="${testUserEmail}"]`)).toContainText(
        "Reactivate account"
      );

      await page.getByRole("button", { name: "All" }).click();
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(adminUserEmail);
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(testUserEmail);
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(
        deactivatedUserEmail
      );

      await page.getByRole("button", { name: "Active" }).click();
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(adminUserEmail);
      await expect(
        page.locator("ul[data-testid='accountsList'] li").filter({ hasText: testUserEmail })
      ).not.toBeVisible();
      await expect(
        page.locator("ul[data-testid='accountsList'] li").filter({ hasText: deactivatedUserEmail })
      ).not.toBeVisible();

      await page.getByRole("button", { name: "Deactivated" }).click();
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(testUserEmail);
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(
        deactivatedUserEmail
      );
      await expect(
        page.locator("ul[data-testid='accountsList'] li").filter({ hasText: adminUserEmail })
      ).not.toBeVisible();

      // Reactivate the test.user account and check the tab states updated correctly
      await page.getByRole("button", { name: "All" }).click();
      await page
        .locator(`li[data-testid="${testUserEmail}"]`)
        .getByRole("button", { name: "Reactivate account" })
        .click();

      await page.getByRole("button", { name: "All" }).click();
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(adminUserEmail);
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(testUserEmail);
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(
        deactivatedUserEmail
      );

      await page.getByRole("button", { name: "Active" }).click();
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(adminUserEmail);
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(testUserEmail);
      await expect(
        page.locator("ul[data-testid='accountsList'] li").filter({ hasText: deactivatedUserEmail })
      ).not.toBeVisible();

      await page.getByRole("button", { name: "Deactivated" }).click();
      await expect(page.locator("ul[data-testid='accountsList'] li")).toContainText(
        deactivatedUserEmail
      );
      await expect(
        page.locator("ul[data-testid='accountsList'] li").filter({ hasText: testUserEmail })
      ).not.toBeVisible();
      await expect(
        page.locator("ul[data-testid='accountsList'] li").filter({ hasText: adminUserEmail })
      ).not.toBeVisible();
    });
  });
});
