import { test, expect } from "@playwright/test";

test.describe("Support Pages", () => {
  test.describe("Support Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/en/support/");
    });

    test("English page loads", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Get support", level: 1 })).toBeVisible();
    });

    test("French page loads", async ({ page }) => {
      await page.locator("a[lang='fr']").click();
      await expect(page).toHaveURL(/\/fr/);
      await expect(
        page.getByRole("heading", { name: "Obtenir du soutien", level: 1 })
      ).toBeVisible();
    });

    test("Required fields stops submission", async ({ page }) => {
      await page.locator("button[type='submit']").click();
      await expect(page.locator("#errorMessagename")).toBeVisible();
    });

    test("Invalid email stops submission", async ({ page }) => {
      await page.fill("#email", "bad@email");
      await page.locator("button[type='submit']").click();
      await expect(page.locator("#errorMessageemail")).toBeVisible();
    });

    test("Non GoC email stops submission", async ({ page }) => {
      await page.fill("#email", "good@email.com");
      await page.locator("button[type='submit']").click();
      await expect(page.locator("#errorMessageemail")).toBeVisible();
    });

    test("Valid submission succeeds", async ({ page }) => {
      await page.fill("#name", "1");
      await page.fill("#email", "good@cds-snc.ca");
      await page.locator("label[for='request-question']").click();
      await page.fill("#description", "1");
      await page.locator("button[type='submit']").click();
      await expect(
        page.getByRole("heading", { name: "Thank you for your submission", level: 1 })
      ).toBeVisible();
    });
  });

  test.describe("Contact Us Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/en/contact");
    });

    test("English page loads", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Contact us", level: 1 })).toBeVisible();
    });

    test("French page loads", async ({ page }) => {
      await page.locator("a[lang='fr']").click();
      await expect(page).toHaveURL(/\/fr/);
      await expect(page.getByRole("heading", { name: "Nous contacter", level: 1 })).toBeVisible();
    });

    test("Required fields stops submission", async ({ page }) => {
      await page.locator("button[type='submit']").click();
      await expect(page.locator("#errorMessagedepartment")).toBeVisible();
    });

    test("Invalid email stops submission", async ({ page }) => {
      await page.fill("#email", "bad@email");
      await page.locator("button[type='submit']").click();
      await expect(page.locator("#errorMessageemail")).toBeVisible();
    });

    test("Non GoC email stops submission", async ({ page }) => {
      await page.fill("#email", "good@email.com");
      await page.locator("button[type='submit']").click();
      await expect(page.locator("#errorMessageemail")).toBeVisible();
    });

    test("Valid submission succeeds", async ({ page }) => {
      await page.fill("#name", "1");
      await page.fill("#email", "good@cds-snc.ca");
      await page.fill("#department", "1");
      await page.fill("#branch", "1");
      await page.fill("#jobTitle", "1");
      await page.locator("label[for='request-question']").click();
      await page.fill("#description", "1");
      await page.locator("button[type='submit']").click();
      await expect(
        page.getByRole("heading", { name: "Thank you for your submission", level: 1 })
      ).toBeVisible();
    });
  });
});
