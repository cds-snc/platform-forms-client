import { test, expect } from "@playwright/test";

test.describe("Test FormBuilder language switching", () => {
  test("Can enter English and French text in Description", async ({ page }) => {
    const addElementButton = page.getByTestId("add-element").filter({ visible: true });
    const langSwitcher = page.getByTestId("lang-switcher").filter({ visible: true });

    // Navigate to form builder
    await page.goto("/en/form-builder/0000/edit");

    // Lang switcher only appears after page hydration
    await expect(langSwitcher).toBeVisible();
    await expect(langSwitcher).toHaveAttribute("aria-activedescendant", "switch-english");

    // Setup a form with one question
    await expect(addElementButton).toBeVisible();
    await addElementButton.click();
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
    await langSwitcher.click();
    await expect(langSwitcher).toHaveAttribute("aria-activedescendant", "switch-french");

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
    await langSwitcher.click();
    await expect(langSwitcher).toHaveAttribute("aria-activedescendant", "switch-english");
    await expect(page.locator("#formTitle")).toHaveValue("Cypress Test Form");
    await expect(page.locator('[aria-label="Form introduction"]')).toContainText(
      "form description in english"
    );
    await expect(page.locator('[aria-label="Page text 1"]')).toContainText("page text in english");
    await expect(page.locator('[aria-label="Privacy statement"]')).toContainText(
      "privacy text in english"
    );

    // Switch back to French
    await langSwitcher.click();
    await expect(langSwitcher).toHaveAttribute("aria-activedescendant", "switch-french");
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
