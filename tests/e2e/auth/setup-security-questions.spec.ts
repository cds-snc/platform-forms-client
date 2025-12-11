import { test, expect } from "@playwright/test";

test.describe("Security Questions Page", () => {
  // NOTE: looking at text values instead of Id's since each run would return different
  // generated question Id's
  const questions1 = "What was your favourite school subject?";
  const questions2 = "What was the name of your first manager?";
  const questions3 = "What was the make of your first car?";

  let sessionCookie: string | undefined;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to login
    await page.goto("/en/auth/login");

    // Fill in credentials
    await page.fill("input[id='username']", "test.withoutsecurityanswers@cds-snc.ca");
    await page.fill("input[id='password']", "testTesttest");

    // Submit login
    await page.locator("button[type='submit']").click();

    // Wait for verification code input
    await page.locator("input[id='verificationCode']").waitFor({ state: "visible" });

    // Fill verification code
    await page.fill("input[id='verificationCode']", "12345");

    // Submit verification
    await page.locator("button[type='submit']").click();

    // Wait for security questions page
    await page.waitForURL(/\/en\/auth\/setup-security-questions/);
    await expect(
      page.getByRole("heading", { name: "Set up security questions", level: 1 })
    ).toBeVisible();

    // Get the session cookie
    const cookies = await context.cookies();
    const cookie = cookies.find((c) => c.name === "authjs.session-token");
    sessionCookie = cookie?.value;

    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    // Set the session cookie
    if (sessionCookie) {
      await page.context().addCookies([
        {
          name: "authjs.session-token",
          value: sessionCookie,
          domain: "localhost",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);
    }
    await page.goto("/en/auth/setup-security-questions");
  });

  test("En page renders", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Set up security questions", level: 1 })
    ).toBeVisible();
  });

  test.describe("Test form validation", () => {
    test("Fails to submit on an empty form", async ({ page }) => {
      await page.locator("#question1").selectOption(questions1);
      await expect(page.locator("#question1")).toHaveValue(/.+/); // Verify selection
      await page.locator("button[type='submit']").click();

      await expect(page.locator("#errorMessageanswer1")).toContainText(
        "Complete the required field to continue."
      );
    });

    test("Fails to submit when a question is not selected", async ({ page }) => {
      await page.locator("#question1").selectOption(questions1);
      await page.fill("#answer1", "1234");
      await page.locator("#question2").selectOption(questions2);
      await page.fill("#answer2", "12345");
      await page.fill("#answer3", "123456");
      await page.locator("button[type='submit']").click();
      await expect(page.locator("p[data-testid='errorMessage']")).toContainText(
        "Complete the required field to continue."
      );
    });

    test("Fails to submit when a answer is not filled in", async ({ page }) => {
      await page.locator("#question1").selectOption(questions1);
      await page.fill("#answer1", "1234");
      await page.locator("#question2").selectOption(questions2);
      await page.fill("#answer2", "12345");
      await page.locator("#question3").selectOption(questions3);
      await page.locator("button[type='submit']").click();
      await expect(page.locator("p[data-testid='errorMessage']")).toContainText(
        "Complete the required field to continue."
      );
    });

    test("Fails to submit when a question is too short", async ({ page }) => {
      await page.locator("#question1").selectOption(questions1);
      await page.fill("#answer1", "1234");
      await page.locator("#question2").selectOption(questions2);
      await page.fill("#answer2", "12345");
      await page.locator("#question3").selectOption(questions3);
      await page.fill("#answer3", "1");
      await page.locator("button[type='submit']").click();
      await expect(page.locator("#errorMessageanswer3")).toContainText(
        "Must be at least 4 characters"
      );
    });

    test("Fails to submit when there is a duplicate answer", async ({ page }) => {
      await page.locator("#question1").selectOption(questions1);
      await page.fill("#answer1", "1234");
      await page.locator("#question2").selectOption(questions2);
      await page.fill("#answer2", "1234");
      await page.locator("#question3").selectOption(questions3);
      await page.fill("#answer3", "abcd");
      await page.locator("button[type='submit']").click();
      await expect(page.locator("#errorMessageanswer1")).toContainText(
        "Answers cannot be the same. Create a unique answer for this question"
      );
    });
  });

  test.describe("Test questions select behavior", () => {
    test("Select a question should update the selected 'value'", async ({ page }) => {
      await page.locator("#question1").selectOption(questions1);
      const value1 = await page.locator("#question1").inputValue();
      const text1 = await page.locator(`#question1 option[value="${value1}"]`).textContent();
      expect(text1?.trim()).toBe(questions1);

      await page.locator("#question2").selectOption(questions2);
      const value2 = await page.locator("#question2").inputValue();
      const text2 = await page.locator(`#question2 option[value="${value2}"]`).textContent();
      expect(text2?.trim()).toBe(questions2);

      await page.locator("#question3").selectOption(questions3);
      const value3 = await page.locator("#question3").inputValue();
      const text3 = await page.locator(`#question3 option[value="${value3}"]`).textContent();
      expect(text3?.trim()).toBe(questions3);
    });
  });

  test.describe("Filling in the form correctly should successfully submit", () => {
    test("Select a question should update the selected 'value'", async ({ page }) => {
      await page.locator("#question1").selectOption(questions1);
      await page.fill("#answer1", "1234");
      await page.locator("#question2").selectOption(questions2);
      await page.fill("#answer2", "12345");
      await page.locator("#question3").selectOption(questions3);
      await page.fill("#answer3", "123456");
      await page.locator("button[type='submit']").click();
      await page.locator("#acceptableUse").click();
      await expect(page).toHaveURL(/\/forms/);
    });
  });
});
