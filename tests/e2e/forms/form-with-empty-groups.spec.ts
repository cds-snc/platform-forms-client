import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("Form with empty groups submission", { tag: "@published-form" }, () => {
  let dbHelper: DatabaseHelper;
  let formId: string;
  let publishedFormPath: string;

  test.beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({
      fixtureName: "formWithEmptyGroups",
      published: true,
    });
    publishedFormPath = `en/id/${formId}`;
  });

  test.afterAll(async () => {
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
  });

  test("fills the required message and submits without a review page", async ({ page }) => {
    await page.goto(publishedFormPath);

    await expect(page.getByText("introduction.", { exact: true })).toBeVisible();
    await expect(page.getByText("privacy policy.", { exact: true })).toBeVisible();

    const message = page.getByRole("textbox", { name: "Message" });
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page.getByRole("heading", { name: "Please correct the errors on the page" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Enter an answer for: Message" })).toBeVisible();
    await expect(page.getByText("Complete the required field to continue.").first()).toBeVisible();

    await message.fill("Testing a form with empty groups");
    await expect(message).toHaveValue("Testing a form with empty groups");

    await expect(page.getByTestId("nextButton")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Review your answers before submitting the form." })
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByRole("heading", { name: "Your form has been submitted" })).toBeVisible({
      timeout: 20000,
    });
  });
});
