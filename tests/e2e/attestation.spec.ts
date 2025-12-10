import { test, expect } from "@playwright/test";
import { FormUploadHelper } from "../helpers/form-upload-helper";
import { userSession } from "../helpers/user-session";

test.describe("Attestation functionality", () => {
  let publishedFormPath: string;

  test.beforeAll(async ({ browser }) => {
    // Create a new page for setup
    const context = await browser.newContext();
    const page = await context.newPage();

    // Authenticate and publish the form once
    await userSession(page);
    const formHelper = new FormUploadHelper(page);
    const formId = await formHelper.uploadFormFixture("attestationTestForm");
    await formHelper.publishForm(formId);
    publishedFormPath = `en/id/${formId}`;

    // Clean up
    await context.close();
  });

  test("Renders properly", async ({ page }) => {
    await page.goto(publishedFormPath);

    // Check that the attestation text is displayed
    await expect(page.locator("body")).toContainText("all checkboxes required");
  });

  test("Displays error when submitting form without checking both boxes", async ({ page }) => {
    await page.goto(publishedFormPath);

    // Submit without checking any boxes
    await page.locator("[type='submit']").click();

    // Verify error messages
    await expect(page.locator("li")).toContainText("Check off all the boxes for");
    await expect(page.getByTestId("errorMessage")).toContainText(
      "Read and check all boxes to confirm the items in this section."
    );
  });

  test("Displays error when submitting form with a single checkbox selected", async ({ page }) => {
    await page.goto(publishedFormPath);

    // Click only the first checkbox
    await page.locator("div[data-testid='1.0']").locator("label").click();

    // Submit the form
    await page.locator("[type='submit']").click();

    // Verify error messages
    await expect(page.locator("li")).toContainText("Check off all the boxes for");
    await expect(page.getByTestId("errorMessage")).toContainText(
      "Read and check all boxes to confirm the items in this section."
    );
  });

  test("Submits properly", async ({ page }) => {
    await page.goto(publishedFormPath);

    // Click both checkboxes
    await page.locator("div[data-testid='1.0']").locator("label").click();
    await page.locator("div[data-testid='1.1']").locator("label").click();

    // Submit the form
    await page.locator("[type='submit']").click();

    // Verify submission confirmation
    await expect(
      page.getByRole("heading", { name: "Your submission has been received" })
    ).toBeVisible();
  });
});
