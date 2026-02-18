import { test, expect } from "@playwright/test";

test.describe("Logout Page test", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/auth/logout");
  });

  test("Display french page version", async ({ page }) => {
    await page.locator("a[lang='fr']").click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Vous êtes déconnecté");
    await expect(page.locator("div[id='login-menu']")).toContainText("Se connecter");
  });

  test("Toggle page language to en", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("You are signed out");
    await expect(page.locator("div[id='login-menu']")).toContainText("Sign in");
  });

  test("Go to login page", async ({ page }) => {
    await page.locator("div[id='login-menu'] > a").click();
    await expect(page).toHaveURL(/\/en\/auth\/login/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sign in");
  });
});
