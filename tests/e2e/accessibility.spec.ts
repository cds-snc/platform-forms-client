import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { FormUploadHelper } from "../helpers/form-upload-helper";
import { userSession } from "../helpers/user-session";

const A11Y_TAGS = ["wcag21aa", "wcag2aa", "best-practice", "section508"];

test.describe("Accessibility (A11Y) Check", () => {
  test.describe("Form Components", () => {
    test("All components page Accessibility (A11Y) Check", async ({ page }) => {
      await userSession(page);
      const formHelper = new FormUploadHelper(page);
      const formID = await formHelper.uploadFormFixture("accessibilityTestForm");

      await page.goto(`/en/id/${formID}`);
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("Check error state accessibility", async ({ page }) => {
      await userSession(page);
      const formHelper = new FormUploadHelper(page);
      const formID = await formHelper.uploadFormFixture("cdsIntakeTestForm");

      await page.goto(`/en/id/${formID}`);
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe("Unauthenticated Pages", () => {
    const pages = [
      { title: "Language selection", path: "/" },
      { title: "Form builder landing", path: "/en/form-builder" },
      { title: "Form builder edit", path: "/en/form-builder/0000/edit" },
      // @todo re-visit this test to see what's failing
      // { title: "Form builder translation", path: "/en/form-builder/0000/edit/translate" },
      { title: "Form builder settings", path: "/en/form-builder/0000/settings" },
      { title: "Terms and conditions", path: "/en/terms-and-conditions" },
      { title: "Service-level agreement", path: "/en/sla" },
      { title: "Create an account", path: "/en/auth/register" },
      { title: "Sign in", path: "/en/auth/login" },
      { title: "Sign out", path: "/en/auth/logout" },
    ];

    for (const pageConfig of pages) {
      test(`${pageConfig.title} Test`, async ({ page }) => {
        // There should not be a user logged in - verify no session cookie
        const cookies = await page.context().cookies();
        expect(cookies.find((c) => c.name === "authjs.session-token")).toBeUndefined();

        await page.goto(pageConfig.path);
        await page.waitForLoadState("networkidle");

        // Ensure page has fully loaded
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(A11Y_TAGS)
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      });
    }
  });

  test.describe("Error Pages", () => {
    test("404 Page", async ({ page }) => {
      const response = await page.goto("/i_do_not_exist_or_should_not", {
        waitUntil: "networkidle",
      });
      expect(response?.status()).toBe(404);

      // Ensure page has fully loaded
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});
