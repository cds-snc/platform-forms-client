import type { Page } from "@playwright/test";

export type UserSessionOptions = { admin?: boolean; acceptableUse?: boolean };

export async function userSession(
  page: Page,
  options: UserSessionOptions = { admin: false, acceptableUse: true }
) {
  const { admin = false, acceptableUse = true } = options;

  // Navigate to login page
  await page.goto("http://localhost:3000/en/auth/login");

  // Wait for login inputs
  await page.locator("input[id='username']").waitFor({ state: "visible" });
  await page.locator("input[id='password']").waitFor({ state: "visible" });

  // Fill credentials (test user accounts used in Cypress)
  await page.fill("input[id='username']", admin ? "test.admin@cds-snc.ca" : "test.user@cds-snc.ca");
  await page.fill("input[id='password']", "testTesttest");

  // Submit login form
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.click("button[type='submit']"),
  ]);

  // Verification code step
  await page.locator("[id='verificationCodeForm']").waitFor({ state: "visible" });
  await page.fill("input[id='verificationCode']", "12345");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.click("button[type='submit']"),
  ]);

  // Wait for auth cookie (authjs.session-token) to be set
  // Use Playwright's cookie API for more reliable checking
  const checkCookie = async (): Promise<boolean> => {
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "authjs.session-token");
    return !!(sessionCookie && sessionCookie.value);
  };

  let cookieFound = false;
  const maxAttempts = 60; // 30 seconds with 500ms intervals

  for (let i = 0; i < maxAttempts; i++) {
    // eslint-disable-next-line no-await-in-loop
    if (await checkCookie()) {
      cookieFound = true;
      break;
    }
    // eslint-disable-next-line no-await-in-loop
    await page.waitForTimeout(500);
  }

  if (!cookieFound) {
    const cookies = await page.context().cookies();
    const cookieNames = cookies.map((c) => c.name).join(", ");
    throw new Error(
      `Session token cookie not set after authentication. Available cookies: ${cookieNames}`
    );
  }

  if (acceptableUse) {
    // Visit policy page and accept
    await page.goto("http://localhost:3000/en/auth/policy", { waitUntil: "networkidle" });

    // Wait for the accept button to be ready (visible and enabled)
    const acceptButton = page.locator("#acceptableUse");
    await acceptButton.waitFor({ state: "visible" });

    // Wait for any hydration to complete
    await page.waitForLoadState("networkidle");

    // Scroll button into view to ensure it's clickable
    await acceptButton.scrollIntoViewIfNeeded();

    // Click and wait for navigation with a longer timeout
    await Promise.all([
      page.waitForURL("**/en/forms", { timeout: 30000 }),
      acceptButton.click({ timeout: 10000 }),
    ]);

    // Ensure we've arrived at forms page and it's fully loaded
    await page.locator("#react-hydration-loader").waitFor({ state: "detached", timeout: 30000 });
    await page.locator("main").waitFor({ state: "visible" });
  }
}
