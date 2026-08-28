import { test, expect, type Page } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("Show/Hide across groups", { tag: "@published-form" }, () => {
  let dbHelper: DatabaseHelper;
  let formId: string;
  let publishedFormPath: string;

  test.beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({
      fixtureName: "showHideGroupsTest",
      published: true,
    });
    publishedFormPath = `en/id/${formId}`;
  });

  test.afterAll(async () => {
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
  });

  const fillOtherField = async (page: Page) => {
    const agreement = page.getByRole("combobox", { name: "Do you agree?" });
    await agreement.selectOption("Other ");

    const otherField = page.locator('[id="4"]');
    await expect(otherField).toBeVisible();
    await otherField.fill("Other response");
    await expect(otherField).toHaveValue("Other response");
  };

  test("shows the Page A optional field after returning and selecting it", async ({ page }) => {
    await page.goto(publishedFormPath);

    await fillOtherField(page);
    await page.locator('label[for="1.0"]').click();
    await expect(page.locator('[id="1.0"]')).toBeChecked();
    await page.getByTestId("nextButton").click();
    await expect(page.getByRole("heading", { level: 2, name: "Page A" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Question A" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Question B" })).toBeHidden();

    const optionalField = page.getByRole("textbox", { name: "A - show optional" });
    await expect(optionalField).toBeHidden();

    await page.getByTestId("backButtonGroup").click();
    await page.locator('label[for="2.0"]').click();
    await expect(page.locator('[id="2.0"]')).toBeChecked();
    await page.getByTestId("nextButton").click();

    await expect(page.getByRole("heading", { level: 2, name: "Page A" })).toBeVisible();
    await expect(optionalField).toBeVisible();
  });

  test("shows the Page B optional field after returning and selecting it", async ({ page }) => {
    await page.goto(publishedFormPath);

    await fillOtherField(page);
    await page.locator('label[for="1.1"]').click();
    await expect(page.locator('[id="1.1"]')).toBeChecked();
    await page.getByTestId("nextButton").click();
    await expect(page.getByRole("heading", { level: 2, name: "Page B" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Question B" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Question A" })).toBeHidden();

    const optionalField = page.getByRole("textbox", { name: "B - show optional" });
    await expect(optionalField).toBeHidden();

    await page.getByTestId("backButtonGroup").click();
    await page.locator('label[for="2.1"]').click();
    await expect(page.locator('[id="2.1"]')).toBeChecked();
    await page.getByTestId("nextButton").click();

    await expect(page.getByRole("heading", { level: 2, name: "Page B" })).toBeVisible();
    await expect(optionalField).toBeVisible();
  });

  test("updates the destination when the radio choice changes after going back", async ({
    page,
  }) => {
    // Purpose: protect group nextAction synchronization when a user changes their destination.
    await page.goto(publishedFormPath);
    await fillOtherField(page);

    await page.locator('label[for="1.0"]').click();
    await page.getByTestId("nextButton").click();
    await expect(page.getByRole("heading", { level: 2, name: "Page A" })).toBeVisible();

    await page.getByTestId("backButtonGroup").click();
    await page.locator('label[for="1.1"]').click();
    await expect(page.locator('[id="1.1"]')).toBeChecked();
    await page.getByTestId("nextButton").click();

    await expect(page.getByRole("heading", { level: 2, name: "Page B" })).toBeVisible();
  });

  test("hides a page field again when its visibility checkbox is unchecked", async ({ page }) => {
    // Purpose: verify visibility responds to both checked and unchecked checkbox values.
    await page.goto(publishedFormPath);
    await fillOtherField(page);

    await page.locator('label[for="1.0"]').click();
    await page.locator('label[for="2.0"]').click();
    await page.getByTestId("nextButton").click();

    const optionalField = page.getByRole("textbox", { name: "A - show optional" });
    await expect(optionalField).toBeVisible();

    await page.getByTestId("backButtonGroup").click();
    await page.locator('label[for="2.0"]').click();
    await expect(page.locator('[id="2.0"]')).not.toBeChecked();
    await page.getByTestId("nextButton").click();

    await expect(optionalField).toBeHidden();
  });

  test("shows both page fields when both visibility checkboxes are selected", async ({ page }) => {
    // Purpose: verify checkbox array values independently control fields on different pages.
    await page.goto(publishedFormPath);
    await fillOtherField(page);

    await page.locator('label[for="1.0"]').click();
    await page.locator('label[for="2.0"]').click();
    await page.locator('label[for="2.1"]').click();
    await page.getByTestId("nextButton").click();

    await expect(page.getByRole("textbox", { name: "A - show optional" })).toBeVisible();
    await page.getByTestId("nextButton").click();

    await expect(page.getByRole("heading", { level: 2, name: "Page B" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "B - show optional" })).toBeVisible();
  });

  test("hides the Other field when the dropdown changes away from Other", async ({ page }) => {
    // Purpose: verify a conditional field reacts when its source value changes.
    await page.goto(publishedFormPath);
    await fillOtherField(page);

    await page.getByRole("combobox", { name: "Do you agree?" }).selectOption("Yes");
    await expect(page.locator('[id="4"]')).toBeHidden();
  });

  test("preserves the Other field value when navigating back to the start page", async ({
    page,
  }) => {
    // Purpose: verify unrelated navigation does not lose an entered conditional field value.
    await page.goto(publishedFormPath);
    await fillOtherField(page);

    await page.locator('label[for="1.0"]').click();
    await page.getByTestId("nextButton").click();
    await page.getByTestId("backButtonGroup").click();

    await expect(page.locator('[id="4"]')).toBeVisible();
    await expect(page.locator('[id="4"]')).toHaveValue("Other response");
  });

  test("does not show hidden optional fields on the review page", async ({ page }) => {
    // Purpose: verify fields hidden by conditional logic are excluded from review output.
    await page.goto(publishedFormPath);
    await fillOtherField(page);

    await page.locator('label[for="1.0"]').click();
    await page.getByTestId("nextButton").click();
    await page.getByTestId("nextButton").click();
    await page.getByTestId("nextButton").click();

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Review your answers before submitting the form.",
      })
    ).toBeVisible();

    const reviewList = page.locator(".my-16");
    await expect(reviewList.getByText("A - show optional", { exact: true })).toHaveCount(0);
    await expect(reviewList.getByText("B - show optional", { exact: true })).toHaveCount(0);
  });
});
