import { test, expect } from "@playwright/test";

test.describe("Register Page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/auth/register");
    await expect(page.getByRole("heading", { name: "Create an account", level: 1 })).toBeVisible();
  });

  test("Error on submitting a form with an empty name field", async ({ page }) => {
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagename")).toContainText(
      "Complete the required field to continue."
    );
  });

  test("No error on submitting a form with a name", async ({ page }) => {
    await page.fill("input[id='name']", "My Name");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagename")).not.toBeVisible();
  });

  test("Error on submitting a form with an empty email field", async ({ page }) => {
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessageusername")).toContainText(
      "Complete the required field to continue."
    );
  });

  test("Error on submitting a form with an invalid email", async ({ page }) => {
    await page.fill("input[id='username']", "myemail@email");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessageusername")).toContainText(
      "Enter a valid government email address."
    );
  });

  test("Error on submitting a form with a non government email", async ({ page }) => {
    await page.fill("input[id='username']", "myemail@email.com");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessageusername")).toContainText(
      "Enter a valid government email address."
    );
  });

  test("No error on submitting a form with a valid government email", async ({ page }) => {
    await page.fill("input[id='username']", "myemail@cds-snc.ca");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessageusername")).not.toBeVisible();
  });

  test("Error on submitting a form with an empty password field", async ({ page }) => {
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagepassword")).toContainText(
      "Complete the required field to continue."
    );
  });

  test("Error on submitting a form with a short password", async ({ page }) => {
    await page.fill("input[id='password']", "pass");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagepassword")).toContainText(
      "must be at least 8 characters"
    );
  });

  test("Error on submitting a form with a long password", async ({ page }) => {
    const longPassword =
      "passpasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspass";
    await page.fill("input[id='password']", longPassword);
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagepassword")).toContainText(
      "must not exceed 50 characters"
    );
  });

  test("Error on submitting a form with no lowercase", async ({ page }) => {
    await page.fill("input[id='password']", "PASSWORD");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagepassword")).toContainText(
      "must contain at least 1 lowercase character"
    );
  });

  test("Error on submitting a form with no uppercase", async ({ page }) => {
    await page.fill("input[id='password']", "password");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagepassword")).toContainText(
      "must contain at least 1 uppercase character"
    );
  });

  test("Error on submitting a form with no number", async ({ page }) => {
    await page.fill("input[id='password']", "Password");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagepassword")).toContainText(
      "Password must contain at least 1 number"
    );
  });

  test("Error on submitting a form with no symbol", async ({ page }) => {
    await page.fill("input[id='password']", "Password1");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagepassword")).toContainText(
      "must contain at least 1 symbol."
    );
  });

  test("No error on submitting a form with a valid password", async ({ page }) => {
    await page.fill("input[id='password']", "Password1!");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagepassword")).not.toBeVisible();
  });

  test("Error on submitting a form with an empty password confirmation field", async ({ page }) => {
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagepasswordConfirmation")).toContainText(
      "Complete the required field to continue."
    );
  });

  test("Error on submitting a form with a non matching password confirmation field", async ({
    page,
  }) => {
    await page.fill("input[id='name']", "My Name");
    await page.fill("input[id='username']", "myemail@cds-snc.ca");
    await page.fill("input[id='password']", "Password1!");
    await page.fill("input[id='passwordConfirmation']", "Password1!!!!!!!");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagepasswordConfirmation")).toContainText(
      "The entries for password must match."
    );
  });

  test("No error on submitting a form with a matching password confirmation field", async ({
    page,
  }) => {
    await page.fill("input[id='password']", "Password1!");
    await page.fill("input[id='passwordConfirmation']", "Password1!");
    await page.locator("button[type='submit']").click();
    await expect(page.locator("#errorMessagepasswordConfirmation")).not.toBeVisible();
  });
});
