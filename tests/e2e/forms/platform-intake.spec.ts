import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";
import { userSession } from "../../helpers/user-session";

test.describe("CDS Platform Intake Form functionality", () => {
  let publishedFormPath: string;
  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    // Create a published template directly in the database
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createPublishedTemplate("requiredAttributesTestForm");
    publishedFormPath = `en/id/${formId}`;
  });

  test.afterAll(async () => {
    // Clean up: delete the template and disconnect
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
    await dbHelper.disconnect();
  });

  test("Fill out and Submit the form", async ({ page }) => {
    test.setTimeout(40000);

    await userSession(page);

    await page.goto(publishedFormPath);

    // Check that the form title is displayed
    await expect(
      page.getByRole("heading", { name: "Work with CDS on a Digital Form" })
    ).toBeVisible();

    // Fill out the form fields
    await page.locator("input[id='2']").fill("Santa Claus");
    await page.locator("input[id='3']").fill("santaclaus@northpole.global");
    await page.locator("input[id='4']").fill("CDS Gifts");
    await page.locator("input[id='5']").fill("877-636-0656");

    // Click all checkboxes
    const checkboxes = page.locator(".gc-checkbox-label");
    const count = await checkboxes.count();

    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line no-await-in-loop
      await checkboxes.nth(i).click();
    }

    await page.locator("input[id='7']").fill("Call me at my work number");

    // Submit the form
    await page.locator("[type='submit']").click();

    // Verify submission confirmation
    await expect(page.getByRole("heading", { name: "Your form has been submitted" })).toBeVisible();
    await expect(page.locator("#content")).toContainText(
      "Thank you. Our team will contact you by email shortly."
    );
  });
});
