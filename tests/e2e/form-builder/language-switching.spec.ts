import { test, expect } from "@playwright/test";

test.describe("Test FormBuilder language switching", () => {
  const addElementButtonText = "Add form element";

  test("Can enter English and French text in Description", async ({ page }) => {
    // Navigate to form builder
    await page.goto("/en/form-builder/0000/edit");

    // Lang switcher only appears after page hydration
    await expect(page.locator('[data-testid="lang-switcher"]')).toBeVisible();
    await expect(page.locator('[data-testid="lang-switcher"]')).toHaveAttribute(
      "aria-activedescendant",
      "switch-english"
    );

    // Setup a form with one question
    await page.locator("button").filter({ hasText: addElementButtonText }).click();
    await page.locator('[data-testid="richText"]').click();
    await page.locator('[data-testid="element-description-add-element"]').click();

    // Enter English Title and Description
    await page.fill("#formTitle", "Cypress Test Form");
    await page.locator("summary").filter({ hasText: "Add a description" }).click();
    await page.fill('[aria-label="Form introduction"]', "form description in english");
    await page.waitForTimeout(500);

    // Enter some English "page text"
    await page.fill('[aria-label="Page text 1"]', "page text in english");
    await page.waitForTimeout(500);

    // Enter English Privacy Statement
    await page.locator("summary").filter({ hasText: "Add a privacy statement" }).click();
    await page.fill('[aria-label="Privacy statement"]', "privacy text in english");
    await page.waitForTimeout(500);

    // Switch to French
    await page.locator('[data-testid="lang-switcher"]').click();
    await expect(page.locator('[data-testid="lang-switcher"]')).toHaveAttribute(
      "aria-activedescendant",
      "switch-french"
    );

    // Enter French Title and Description
    await page.fill("#formTitle", "Formulaire de test Cypress");
    await page.waitForTimeout(500);

    await expect(page.locator("#formTitle")).toHaveValue("Formulaire de test Cypress");
    await page.fill('[aria-label="Form introduction"]', "form description in french");
    await page.waitForTimeout(500);

    // Enter some French "page text"
    await page.fill('[aria-label="Page text 1"]', "page text in french");
    await page.waitForTimeout(500);

    // Enter French Privacy Statement
    await page.fill('[aria-label="Privacy statement"]', "privacy text in french");
    await page.waitForTimeout(500);

    // Switch back to English
    await page.locator('[data-testid="lang-switcher"]').click();
    await expect(page.locator('[data-testid="lang-switcher"]')).toHaveAttribute(
      "aria-activedescendant",
      "switch-english"
    );
    await expect(page.locator("#formTitle")).toHaveValue("Cypress Test Form");
    await expect(page.locator('[aria-label="Form introduction"]')).toContainText(
      "form description in english"
    );
    await expect(page.locator('[aria-label="Page text 1"]')).toContainText("page text in english");
    await expect(page.locator('[aria-label="Privacy statement"]')).toContainText(
      "privacy text in english"
    );

    // Switch back to French
    await page.locator('[data-testid="lang-switcher"]').click();
    await expect(page.locator('[data-testid="lang-switcher"]')).toHaveAttribute(
      "aria-activedescendant",
      "switch-french"
    );
    await expect(page.locator("#formTitle")).toHaveValue("Formulaire de test Cypress");
    await expect(page.locator('[aria-label="Form introduction"]')).toContainText(
      "form description in french"
    );
    await expect(page.locator('[aria-label="Page text 1"]')).toContainText("page text in french");
    await expect(page.locator('[aria-label="Privacy statement"]')).toContainText(
      "privacy text in french"
    );
  });
});
