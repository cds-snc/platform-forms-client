import { test, expect } from "@playwright/test";
import { userSession } from "../../helpers/user-session";

test.describe("Test acceptable use Page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await userSession(page, { acceptableUse: false });
    await page.goto("/en/auth/policy");
    await page.waitForLoadState("networkidle");
  });

  test("En page renders properly", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Know your responsibilities" })
    ).toBeVisible();
    await expect(page.locator("#acceptableUse")).toContainText("Agree");
  });

  test("Fr page renders properly", async ({ page }) => {
    // Switch language by clicking the French link
    await page.getByRole("link", { name: "Français" }).click();
    await expect(page).toHaveURL(/\/fr\//);

    await expect(
      page.getByRole("heading", { level: 1, name: "Connaissez vos responsabilités" })
    ).toBeVisible();
    await expect(page.locator("#acceptableUse")).toContainText("Accepter");
  });

  test("Agree to the terms of use", async ({ page }) => {
    await page.goto("/en/auth/policy");
    await page.waitForLoadState("networkidle");

    await page.locator("#acceptableUse").click();

    await expect(page).toHaveURL(/\/en\/forms$/);
  });

  test("Redirects back to terms of use if not accepted", async ({ page }) => {
    await page.goto("/en/forms");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();
    await expect(page).toHaveURL(/\/en\/auth\/policy/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Know your responsibilities" })
    ).toBeVisible();
  });

  test("Redirects back to calling page after acceptance", async ({ page }) => {
    await page.goto("/en/forms");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();
    await expect(page).toHaveURL(/\/en\/auth\/policy/);

    await page.locator("#acceptableUse").click();

    await expect(page).toHaveURL(/\/en\/forms$/);
  });
});
