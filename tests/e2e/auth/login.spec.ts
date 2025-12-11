import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.describe("User login screen", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/en/auth/login");
    });

    test("EN page renders", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Sign in");
      await expect(page.locator("input[id='username']")).toBeVisible();
      await expect(page.locator("input[id='password']")).toBeVisible();
    });

    test("Change page language", async ({ page }) => {
      await page.locator("a[lang='fr']").click();
      // Ensure page has fully loaded
      await expect(page.locator("main")).toBeVisible();
      await expect(page).toHaveURL(/\/fr/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Se connecter");
    });

    test("Displays an error message when submitting an empty form.", async ({ page }) => {
      await expect(page.locator("button[type='submit']")).toBeVisible();
      await page.locator("button[type='submit']").click();
      await expect(page.locator("[data-testid='alert']")).toBeVisible();
    });

    test("Displays an error message when submitting an empty username.", async ({ page }) => {
      await expect(page.locator("button[type='submit']")).toBeVisible();
      await page.locator("button[type='submit']").click();
      await expect(page.locator("[id='errorMessageusername']")).toContainText(
        "Complete the required field to continue."
      );
    });

    test("Displays an error message when submitting an invalid email", async ({ page }) => {
      await page.fill("input[id='username']", "myemail@cds-snc");
      await expect(page.locator("button[type='submit']")).toBeVisible();
      await page.locator("button[type='submit']").click();
      await expect(page.locator("[id='errorMessageusername']")).toBeVisible();
      await expect(page.locator("[id='errorMessageusername']")).toContainText(
        "Enter a valid government email address."
      );
    });

    test("Displays no error message when submitting a valid email", async ({ page }) => {
      await page.fill("input[id='username']", "test@cds-snc.ca");
      await expect(page.locator("button[type='submit']")).toBeVisible();
      await page.locator("button[type='submit']").click();
      await expect(page.locator("[id='errorMessageusername']")).not.toBeVisible();
    });

    test("Displays an error message when submitting an empty password.", async ({ page }) => {
      await expect(page.locator("button[type='submit']")).toBeVisible();
      await page.locator("button[type='submit']").click();
      await expect(page.locator("[id='errorMessageusername']")).toBeVisible();
      await expect(page.locator("[id='errorMessagepassword']")).toContainText(
        "Complete the required field to continue."
      );
    });

    test("Displays an error message when submitting a password greater than 50 characters", async ({
      page,
    }) => {
      await page.fill(
        "input[id='password']",
        "AAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaH"
      );
      await expect(page.locator("button[type='submit']")).toBeVisible();
      await page.locator("button[type='submit']").click();
      await expect(page.locator("[id='errorMessagepassword']")).toContainText(
        "Password cannot exceed 50 characters."
      );
    });

    test("Displays no error message when submitting a valid password", async ({ page }) => {
      await page.fill("input[id='password']", "AAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      await expect(page.locator("button[type='submit']")).toBeVisible();
      await page.locator("[type='submit']").click();
      await expect(page.locator("[id='errorMessagepassword']")).not.toBeVisible();
    });
  });

  test.describe("User 2FA screen", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/en/auth/login");
      await expect(page.locator("input[id='username']")).toBeVisible();
      await expect(page.locator("input[id='password']")).toBeVisible();
      await page.fill("input[id='username']", "test.user@cds-snc.ca");
      await page.fill("input[id='password']", "testTesttest");
      await expect(page.locator("button[type='submit']")).toBeVisible();
      await page.locator("button[type='submit']").click();
      await expect(page.locator("[id='verificationCodeForm']")).toBeVisible();
    });

    test("page renders", async ({ page }) => {
      await expect(page.locator("[id='verificationCodeForm']")).toBeVisible();
      await expect(page.locator("input[id='verificationCode']")).toBeVisible();
      await expect(page.locator("button[type='submit']")).toBeVisible();
    });

    test("Displays an error message when submitting an empty form.", async ({ page }) => {
      await expect(page.locator("[id='verificationCodeForm']")).toBeVisible();
      await expect(page.locator("button[type='submit']")).toBeVisible();
      await page.locator("button[type='submit']").click();
      await expect(page.locator("[data-testid='errorMessage']")).toBeVisible();
    });

    test("Displays an error message when submitting wrong number of characters.", async ({
      page,
    }) => {
      await expect(page.locator("[id='verificationCodeForm']")).toBeVisible();
      await expect(page.locator("input[id='verificationCode']")).toBeVisible();
      await page.fill("input[id='verificationCode']", "12");
      await expect(page.locator("button[type='submit']")).toBeVisible();
      await page.locator("button[type='submit']").click();
      await expect(page.locator("[data-testid='errorMessage']")).toBeVisible();
    });

    test("Displays an error message when submitting a symbol in the verification code.", async ({
      page,
    }) => {
      await expect(page.locator("[id='verificationCodeForm']")).toBeVisible();
      await expect(page.locator("input[id='verificationCode']")).toBeVisible();
      await page.fill("input[id='verificationCode']", "12/34");
      await expect(page.locator("button[type='submit']")).toBeVisible();
      await page.locator("button[type='submit']").click();
      await expect(page.locator("[data-testid='errorMessage']")).toBeVisible();
    });
  });
});
