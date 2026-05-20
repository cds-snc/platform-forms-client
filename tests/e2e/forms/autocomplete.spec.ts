import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("Testing a form element autocomplete attributes", () => {
  let publishedFormPath: string;
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    // Create a published template directly in the database
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({
      fixtureName: "autocompleteAttributesTestForm",
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
    await expect(page.locator("h1")).toContainText("An Autocomplete Attribute Test Form");
  });

  test("Has correct autocomplete attributes on fields", async ({ page }) => {
    await page.goto(publishedFormPath);

    const autocompleteOptions = [
      ["additional-name", "Middle name"],
      ["address-level1", "Province"],
      ["address-level2", "City"],
      ["address-line1", "Address line 1"],
      ["address-line2", "Address line 2"],
      ["address-line3", "Address line 3"],
      ["bday", "Date of birth"],
      ["bday-day", "Birth day"],
      ["bday-month", "Birth month"],
      ["bday-year", "Birth year"],
      ["country", "Country code"],
      ["country-name", "Country"],
      ["email", "Email address"],
      ["family-name", "Last name"],
      ["given-name", "First name"],
      ["honorific-prefix", "Name prefix"],
      ["honorific-suffix", "Name suffix"],
      ["language", "Language"],
      ["name", "Full name"],
      ["organization-title", "Job title"],
      ["tel", "Phone number"],
      ["postal-code", "Postal code"],
      ["url", "Website address"],
    ];

    for (const [autocompleteValue, description] of autocompleteOptions) {
      const locator = page.locator(`input[autocomplete='${autocompleteValue}']`);
      // eslint-disable-next-line no-await-in-loop
      await expect(
        locator,
        `Field with autocomplete='${autocompleteValue}' (${description})`
      ).toHaveCount(1);
    }
  });
});
