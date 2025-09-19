import { test, expect } from "@playwright/test";

test.describe("Test FormBuilder Add Elements", () => {
  const addElementButtonText = "Add form element";

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }); // macbook-15 equivalent

    // Initialize a new form by going to the start page first
    await page.goto("/en/form-builder");

    // Click "Start from scratch" to initialize a new form
    await page.getByRole("button", { name: /start/i }).click();

    // Wait for navigation to the edit page
    await page.waitForURL(/\/form-builder\/0000\/edit/);
    await page.waitForLoadState("networkidle");
  });

  test("Adds a Page Text element", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("richText").click();
    await page.getByTestId("element-description-add-element").click();
    await expect(page.getByTestId("richText")).toBeVisible();
  });

  test("Adds a Short Answer element", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("textField").click();
    await page.getByTestId("element-description-add-element").click();

    await expect(page.locator("#item-1")).toHaveAttribute("placeholder", "Question");
    await expect(page.locator(".example-text")).toContainText("Short answer");
  });

  test("Adds a Long Answer element", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("textArea").click();
    await page.getByTestId("element-description-add-element").click();

    await expect(page.locator("#item-1")).toHaveAttribute("placeholder", "Question");
    await expect(page.locator(".example-text")).toContainText("Long answer");
  });

  test("Adds a Single choice element", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("radio").click();
    await page.getByTestId("element-description-add-element").click();

    await expect(page.locator("#item-1")).toHaveAttribute("placeholder", "Question");
    await expect(page.locator("#option--1--1")).toHaveAttribute("type", "text");
    await expect(page.locator("#option--1--1")).toHaveAttribute("placeholder", "Option 1");
    await expect(page.locator(".example-text")).toContainText("Radio buttons");
  });

  test("Adds a Multiple choice element", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("checkbox").click();
    await page.getByTestId("element-description-add-element").click();

    await expect(page.locator("#item-1")).toHaveAttribute("placeholder", "Question");
    await expect(page.locator("#option--1--1")).toHaveAttribute("placeholder", "Option 1");
    await expect(page.locator(".example-text")).toContainText("Checkboxes");
  });

  test("Adds a Dropdown list element", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("basic-filter").click();
    await page.getByTestId("dropdown").click();
    await page.getByTestId("element-description-add-element").click();

    await expect(page.locator("#item-1")).toHaveAttribute("placeholder", "Question");
    await expect(page.locator("#option--1--1")).toHaveAttribute("placeholder", "Option 1");
    await expect(page.locator(".example-text")).toContainText("Dropdown");
  });

  test("Adds a Date element", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("preset-filter").click();
    await page.getByTestId("formattedDate").click();
    await page.getByTestId("element-description-add-element").click();

    await expect(page.locator("#item-1")).toHaveAttribute("placeholder", "Question");
  });

  test("Adds a Numeric field element", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("preset-filter").click();
    await page.getByTestId("number").click();
    await page.getByTestId("element-description-add-element").click();

    await expect(page.locator("#item-1")).toHaveAttribute("placeholder", "Question");
    await expect(page.getByTestId("description-text")).toContainText("Enter a number");
    await expect(page.getByTestId("number")).toContainText("0123456789");

    await page.goto("/en/form-builder/0000/preview");
    await expect(page.getByTestId("textInput")).toHaveAttribute("inputmode", "numeric");
  });

  test("Renders attestation block", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("basic-filter").click();
    await page.getByTestId("attestation").click();
    await page.getByTestId("element-description-add-element").click();

    await page.locator("#item-1").scrollIntoViewIfNeeded();
    await expect(page.locator("#item-1")).toHaveValue("I agree to:");
    await expect(page.locator("#option--1--1")).toHaveValue("Condition 1");
    await expect(page.locator("#option--1--2")).toHaveValue("Condition 2");
    await expect(page.locator("#option--1--3")).toHaveValue("Condition 3");
    await expect(page.locator("#required-1-id")).toBeDisabled();
    await expect(page.locator("#required-1-id")).toBeChecked();

    await page.goto("/en/form-builder/0000/preview");
    await expect(page.locator("#label-1")).toContainText("all checkboxes required");
    await expect(page.getByText("Condition 1")).toBeVisible();
    await expect(page.getByText("Condition 2")).toBeVisible();
    await expect(page.getByText("Condition 3")).toBeVisible();
  });

  test("Renders matching element description in more modal", async ({ page }) => {
    // see https://github.com/cds-snc/platform-forms-client/issues/2017
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("preset-filter").click();
    await page.getByTestId("number").click();
    await page.getByTestId("element-description-add-element").click();

    await expect(page.getByTestId("description-text")).toBeVisible();
    await expect(page.getByTestId("description-text")).toContainText("Enter a number");
    await expect(page.locator(".example-text")).toBeVisible();
    await expect(page.locator(".example-text")).toContainText("0123456789");

    await page.locator('#element-1 [data-testid="more"]').click();
    await expect(page.getByTestId("description-input")).toContainText("Enter a number");
    await page.getByTestId("close-dialog").click();
  });

  test("Adds a Name block with autocomplete", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("name").click();
    await page.getByTestId("element-description-add-element").click();

    await expect(page.getByTestId("autocomplete-1")).toContainText("Full name");

    await page.goto("/en/form-builder/0000/preview");
    await expect(page.getByTestId("textInput")).toHaveAttribute("autocomplete", "name");
  });

  test("Adds a Name (3 fields) block with autocomplete", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("firstMiddleLastName").click();
    await page.getByTestId("element-description-add-element").click();

    await expect(page.getByTestId("autocomplete-2")).toContainText("First name");
    await expect(page.getByTestId("autocomplete-3")).toContainText("Middle name");
    await expect(page.getByTestId("autocomplete-4")).toContainText("Last name");

    await page.goto("/en/form-builder/0000/preview");

    const textInputs = page.getByTestId("textInput");
    await expect(textInputs.nth(0)).toHaveAttribute("autocomplete", "given-name");
    await expect(textInputs.nth(1)).toHaveAttribute("autocomplete", "additional-name");
    await expect(textInputs.nth(2)).toHaveAttribute("autocomplete", "family-name");
  });

  test("Adds a Contact block with autocomplete", async ({ page }) => {
    await page.getByRole("button", { name: addElementButtonText }).click();

    await page.getByTestId("contact").click();
    await page.getByTestId("element-description-add-element").click();

    await expect(page.getByTestId("autocomplete-2")).toContainText("Phone number");
    await expect(page.getByTestId("autocomplete-3")).toContainText("Email address");

    await page.goto("/en/form-builder/0000/preview");

    const textInputs = page.getByTestId("textInput");
    await expect(textInputs.nth(0)).toHaveAttribute("autocomplete", "tel");
    await expect(textInputs.nth(1)).toHaveAttribute("autocomplete", "email");
  });

  test.describe("Test FormBuilder autocomplete props", () => {
    const autocompleteOptions = [
      ["additional-name", "Middle name"],
      ["address-level1", "Province, State"],
      ["address-level2", "City, town, community"],
      ["address-line1", "Address line 1 (civic number and street name)"],
      ["address-line2", "Address line 2 (apartment or suite)"],
      ["address-line3", "Address line 3 (other address details)"],
      ["bday", "Date of birth"],
      ["bday-day", "Birth day"],
      ["bday-month", "Birth month"],
      ["bday-year", "Birth year"],
      ["country", "Country code (2 letter country identifier)"],
      ["country-name", "Country"],
      ["email", "Email address"],
      ["family-name", "Last name"],
      ["given-name", "First name"],
      ["honorific-prefix", "Name prefix, Mr, Mrs, Dr"],
      ["honorific-suffix", "Name suffix, Jr, B.Sc,"],
      ["language", "Language"],
      ["name", "Full name (includes first, middle, and last names"],
      ["organization-title", "Job title"],
      ["tel", "Phone number"],
      ["postal-code", "Postal or zip code"],
      ["url", "Website address"],
    ];

    test("Checks the autocomplete list", async ({ page }) => {
      await page.getByRole("button", { name: addElementButtonText }).click();

      await expect(page.getByTestId("dialog")).toBeVisible();
      await page.getByTestId("textField").click();
      await page.getByTestId("element-description-add-element").click();

      await page.getByTestId("more").click();
      await expect(page.locator('[data-testid="autocomplete"] > option')).toHaveCount(
        autocompleteOptions.length + 1
      );
    });

    for (const [optionValue, optionText] of autocompleteOptions) {
      test(`Adds a TextAreaInput with ${optionValue} autocomplete`, async ({ page }) => {
        await page.getByRole("button", { name: addElementButtonText }).click();

        await expect(page.getByTestId("dialog")).toBeVisible();

        await expect(page.getByTestId("textField")).toBeVisible();
        await page.getByTestId("textField").click();
        await page.getByTestId("element-description-add-element").click();

        await expect(page.locator("#item-1")).toHaveAttribute("placeholder", "Question");
        await expect(page.locator(".example-text")).toContainText("Short answer");

        await page.getByTestId("more").click();
        await page.getByTestId("autocomplete").selectOption(optionValue);

        await page.getByTestId("more-modal-save-button").getByText("Save").click();
        await expect(page.getByTestId("autocomplete-1")).toContainText(optionText);

        await page.goto("/en/form-builder/0000/preview");
        await expect(page.getByTestId("textInput")).toHaveAttribute("autocomplete", optionValue);
      });
    }
  });
});
