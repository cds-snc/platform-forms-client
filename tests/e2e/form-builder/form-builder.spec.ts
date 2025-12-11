import { test, expect } from "@playwright/test";

test.describe("Test FormBuilder", () => {
  test("Renders form builder home page", async ({ page }) => {
    await page.goto("/en/form-builder");
    await expect(page.locator("[data-testid='start-new-form'] h2")).toContainText("Design a form");
    await expect(page.locator("[data-testid='start-upload-form'] h2")).toContainText(
      "Open a form file"
    );

    await page.locator("a[lang='fr']").click();
    await expect(page.locator("[data-testid='start-new-form'] h2")).toContainText(
      "Créer un formulaire"
    );
    await expect(page.locator("[data-testid='start-upload-form'] h2")).toContainText(
      "Ouvrir un formulaire"
    );
  });

  test("Designs a form", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }); // macbook-15 equivalent
    await page.goto("/en/form-builder/0000/edit");
    await page.waitForLoadState("networkidle");

    await page.fill("#formTitle", "Cypress Test Form");
    await expect(page.locator("#formTitle")).toHaveValue("Cypress Test Form");

    await page.getByRole("button", { name: "Form set-up" }).click();

    // Form description
    await page
      .locator("summary")
      .filter({ hasText: "Add a description to your form to help set expectations" })
      .click();
    await page.locator('[aria-label="Form introduction"]').fill("form description");
    await expect(page.locator('[aria-label="Form introduction"]')).toContainText(
      "form description"
    );

    // Privacy statement
    await page
      .locator("summary")
      .filter({ hasText: "Add a privacy statement to outline how you handle personal information" })
      .click();
    await page.locator('[aria-label="Privacy statement"]').fill("privacy statement");
    await expect(page.locator('[aria-label="Privacy statement"]')).toContainText(
      "privacy statement"
    );

    await page.getByRole("button", { name: "Add form element" }).click();

    await page.getByTestId("radio").click();
    await page.getByTestId("element-description-add-element").click();

    await page.fill("#item-1", "Question 1");
    await expect(page.locator("#item-1")).toHaveValue("Question 1");

    await page.fill("#option--1--1", "option 1");
    await expect(page.locator("#option--1--1")).toHaveValue("option 1");

    await page.getByRole("button", { name: "Add option" }).click();

    await page.fill("#option--1--2", "option 2");
    await expect(page.locator("#option--1--2")).toHaveValue("option 2");

    // @todo re-visit this later
    // Confirmation message
    // await page.locator('[aria-label="Confirmation message"]').fill("confirmation page");

    // open modal
    await page.locator("#item-1").click();
    await page.getByRole("button", { name: "More" }).click();
    await expect(
      page.locator("[data-testid='dialog']").getByRole("heading", { level: 2 })
    ).toContainText("More options");
    await expect(page.locator("#title--modal--1")).toHaveValue("Question 1");

    await page.fill("#title--modal--1", "Question 1-1");
    await expect(page.locator("#title--modal--1")).toHaveValue("Question 1-1");

    await page.fill("#description--modal--1", "Question 1 description");
    await expect(page.locator("#description--modal--1")).toHaveValue("Question 1 description");

    await page.locator("#required-1-id-modal").check({ force: true });
    await page.getByTestId("more-modal-save-button").click({ force: true });

    // re-check form editor
    await page.locator("#item-1").scrollIntoViewIfNeeded();
    await expect(page.locator("#item-1")).toHaveValue("Question 1-1");
    await expect(page.locator("#item1-describedby")).toContainText("Question 1 description");
    await expect(page.locator("#required-1-id")).toBeChecked();

    // preview form
    await page.getByTestId("preview").click();
    await expect(page.locator("[data-testid='preview-container'] h1")).toContainText(
      "Cypress Test Form"
    );
    await expect(page.locator("[data-testid='preview-container']")).toContainText(
      "form description"
    );
    await expect(page.locator("[data-testid='preview-container'] #label-1")).toContainText(
      "Question 1-1"
    );
    await expect(page.locator("[data-testid='preview-container'] #desc-1")).toContainText(
      "Question 1 description"
    );
    await expect(
      page.locator("[data-testid='preview-container'] .gc-input-radio").first()
    ).toContainText("option 1");
    await expect(
      page.locator("[data-testid='preview-container'] #PreviewSubmitButton")
    ).toContainText("Sign in to test how you can submit and view responses");

    // settings
    // await page.getByTestId("settings").click();
    // await expect(page.getByRole("heading", { level: 1 })).toContainText("Settings");

    // publish form
    await page.getByTestId("publish").click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("You can't publish yet");
    await page.getByRole("link", { name: "create one now" }).click();

    // can visit create account
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
