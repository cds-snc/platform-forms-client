import { test, expect } from "@playwright/test";

test.describe("Test FormBuilder language switching", () => {
  test("Can enter English and French text in Description", async ({ page }) => {
    const waitForEditorSave = async () => page.waitForTimeout(150);
    const addElementButton = page.getByTestId("add-element").filter({ visible: true });
    const langSwitcher = page.getByTestId("lang-switcher").filter({ visible: true });
    const formTitle = page.locator("#formTitle");
    const formIntroduction = page.locator('[aria-label="Form introduction"]');
    const pageText = page.locator('[aria-label="Page text 1"]');
    const privacyStatement = page.locator('[aria-label="Privacy statement"]');

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
    await expect(formTitle).toBeEditable();
    await formTitle.fill("Cypress Test Form");
    await expect(formTitle).toHaveValue("Cypress Test Form");
    await page.locator("summary").filter({ hasText: "Add a description" }).click();
    await expect(formIntroduction).toBeEditable();
    await formIntroduction.fill("form description in english");
    await expect(formIntroduction).toContainText("form description in english");
    await waitForEditorSave();

    // Enter some English "page text"
    await expect(pageText).toBeEditable();
    await pageText.fill("page text in english");
    await expect(pageText).toContainText("page text in english");
    await waitForEditorSave();

    // Enter English Privacy Statement
    await page.locator("summary").filter({ hasText: "Add a privacy statement" }).click();
    await expect(privacyStatement).toBeEditable();
    await privacyStatement.fill("privacy text in english");
    await expect(privacyStatement).toContainText("privacy text in english");
    await waitForEditorSave();

    // Switch to French
    await langSwitcher.click();
    await expect(langSwitcher).toHaveAttribute("aria-activedescendant", "switch-french");

    // Enter French Title and Description
    await expect(formTitle).toBeEditable();
    await formTitle.fill("Formulaire de test Cypress");
    await expect(formTitle).toHaveValue("Formulaire de test Cypress");
    await expect(formIntroduction).toBeEditable();
    await formIntroduction.fill("form description in french");
    await expect(formIntroduction).toContainText("form description in french");
    await waitForEditorSave();

    // Enter some French "page text"
    await expect(pageText).toBeEditable();
    await pageText.fill("page text in french");
    await expect(pageText).toContainText("page text in french");
    await waitForEditorSave();

    // Enter French Privacy Statement
    await expect(privacyStatement).toBeEditable();
    await privacyStatement.fill("privacy text in french");
    await expect(privacyStatement).toContainText("privacy text in french");
    await waitForEditorSave();

    // Switch back to English
    await langSwitcher.click();
    await expect(langSwitcher).toHaveAttribute("aria-activedescendant", "switch-english");
    await expect(formTitle).toHaveValue("Cypress Test Form");
    await expect(formIntroduction).toContainText("form description in english");
    await expect(pageText).toContainText("page text in english");
    await expect(privacyStatement).toContainText("privacy text in english");

    // Switch back to French
    await langSwitcher.click();
    await expect(langSwitcher).toHaveAttribute("aria-activedescendant", "switch-french");
    await expect(formTitle).toHaveValue("Formulaire de test Cypress");
    await expect(formIntroduction).toContainText("form description in french");
    await expect(pageText).toContainText("page text in french");
    await expect(privacyStatement).toContainText("privacy text in french");
  });
});
