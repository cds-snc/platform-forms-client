import { test, expect } from "@playwright/test";
import { FormUploadHelper } from "../helpers/form-upload-helper";
import { userSession } from "../helpers/user-session";

test.describe("Attestation functionality", () => {
  test("Renders properly", async ({ page }) => {
    const formHelper = new FormUploadHelper(page);

    // Upload the form fixture - this will automatically navigate to preview
    await formHelper.uploadFormFixture("attestationTestForm", true);

    // Check that the attestation text is displayed
    await expect(page.locator("body")).toContainText("all checkboxes required");
  });

  test("Displays error when submitting form without checking both boxes", async ({ page }) => {
    test.setTimeout(120000);

    await userSession(page);

    const formHelper = new FormUploadHelper(page);

    // Upload the form fixture - this will automatically navigate to preview
    const formId = await formHelper.uploadFormFixture("attestationTestForm");

    await formHelper.publishForm(formId);

    await page.goto(`en/id/${formId}`);

    // Submit without checking any boxes
    await page.locator("[type='submit']").click();

    // Verify error messages
    await expect(page.locator("li")).toContainText("Check off all the boxes for");
    await expect(page.getByTestId("errorMessage")).toContainText(
      "Read and check all boxes to confirm the items in this section."
    );
  });

  test("Displays error when submitting form with a single checkbox selected", async ({ page }) => {
    test.setTimeout(120000);

    await userSession(page);

    const formHelper = new FormUploadHelper(page);

    // Upload the form fixture - this will automatically navigate to preview
    const formId = await formHelper.uploadFormFixture("attestationTestForm");

    await formHelper.publishForm(formId);

    await page.goto(`en/id/${formId}`);

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
    test.setTimeout(120000);

    await userSession(page);
    const formHelper = new FormUploadHelper(page);

    // Upload the form fixture - this will automatically navigate to preview
    const formId = await formHelper.uploadFormFixture("attestationTestForm");

    await formHelper.publishForm(formId);

    await page.goto(`en/id/${formId}`);

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
