import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("Testing a basic frontend form", { tag: "@published-form" }, () => {
  let publishedFormPath: string;
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    // Create a published template directly in the database
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({
      fixtureName: "requiredAttributesTestForm",
      published: true,
    });
    publishedFormPath = `en/id/${formId}`;
  });

  test.afterAll(async () => {
    // Clean up: delete the template and disconnect
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
  });

  test("Renders properly", async ({ page }) => {
    await page.goto(publishedFormPath);

    // Check that the attestation text is displayed
    await expect(page.locator("body")).toContainText("A Required Attributes Test Form");
  });

  test.describe("Required Attributes", () => {
    test("Displays errors when submitting empty form", async ({ page }) => {
      await page.goto(publishedFormPath);
      const shortAnswerErrorLink = page.getByRole("link", {
        name: "Enter an answer for: A Required Short Answer",
      });

      // Submit the empty form
      await page.getByRole("button", { name: "Submit" }).click();

      await expect(
        page.getByRole("heading", { name: "Please correct the errors on the page." })
      ).toBeVisible();
      await expect(shortAnswerErrorLink).toBeVisible();
      await expect(
        page.getByText("Complete the required field to continue.").first()
      ).toBeVisible();
    });

    test("Fills required fields and submits properly", async ({ page }) => {
      await page.goto(publishedFormPath);
      const shortAnswerInput = page.locator('[id="1"]');
      const radioGroup = page.getByRole("group", { name: /A Required Radio/ });
      const nextButton = page.getByTestId("nextButton");
      const reviewHeading = page.getByRole("heading", {
        level: 2,
        name: "Review your answers before submitting the form.",
      });

      // Fill in required fields
      await shortAnswerInput.click();
      await shortAnswerInput.pressSequentially("Testing");
      await expect(shortAnswerInput).toHaveValue("Testing");
      await page.getByRole("checkbox", { name: "One" }).check({ force: true });
      await radioGroup.getByText("One").click();
      await expect(radioGroup.getByRole("radio", { name: "One" })).toBeChecked();
      await page.getByRole("combobox", { name: "A Required Dropdown" }).selectOption("One");

      if (await nextButton.isVisible()) {
        await nextButton.click();
        await expect(reviewHeading).toBeVisible();
      }

      await page.getByRole("button", { name: "Submit" }).click();

      // Verify inline submission confirmation
      await expect(page.getByRole("heading", { name: "Your form has been submitted" })).toBeVisible(
        { timeout: 20000 }
      );
    });
  });
});
