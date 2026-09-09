import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers/database-helper";

test.describe("Publishing a form", () => {
  test.use({ storageState: "tests/.auth/user-admin.json" });

  let formId: string;
  let dbHelper: DatabaseHelper;

  test.beforeAll(async () => {
    // Create a published template directly in the database
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({
      fixtureName: "publishTestForm",
      published: false,
      userEmail: "test.admin@cds-snc.ca",
    });
  });

  test.afterAll(async () => {
    // Clean up: delete the template and disconnect
    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
  });

  test("Can publish a form", async ({ page }) => {
    // Navigate to settings page
    await page.goto(`/en/form-builder/${formId}/settings`);
    await page.waitForLoadState("networkidle");

    // Wait for settings page to be ready
    await page.waitForTimeout(1000);

    // We should already be on the settings page, but wait for the Intended Use section
    const intendedUseHeading = page.getByRole("heading", { name: "Intended use" });
    await intendedUseHeading.waitFor({ state: "visible", timeout: 10000 });

    // Scroll to the Intended Use section
    await intendedUseHeading.scrollIntoViewIfNeeded();

    // Click the first radio button (admin purpose) using the ID
    const intendedUseRadio = page.locator("input#purposeAndUseAdmin");
    await intendedUseRadio.scrollIntoViewIfNeeded();
    await intendedUseRadio.waitFor({ state: "visible", timeout: 5000 });
    await intendedUseRadio.check({ force: true });
    await expect(intendedUseRadio).toBeChecked();
    await expect(page.getByText("Your changes have been saved.")).toBeVisible({ timeout: 10000 });

    // Navigate to publish page
    await page.goto(`/en/form-builder/${formId}/publish`);

    // Click the Publish button to open the dialog
    const publishButton = page.getByRole("main").getByRole("button", { name: /publish/i });
    await expect(publishButton).toBeVisible();
    await publishButton.click();

    // Fill in the "Publish form"
    const publishDialog = page.getByRole("heading", { name: "Publish form" });
    await expect(publishDialog).toBeVisible();

    // Select a reason for publishing (first radio button)
    const reasonRadio = page.locator('input[type="radio"]').first();
    await reasonRadio.click();

    // Click Continue to publish
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForLoadState("networkidle");

    // Fill in "Tell us more about your form"
    const tellUsMoreDialog = page.getByRole("heading", {
      name: "Tell us more about your form",
    });

    await expect(tellUsMoreDialog).toBeVisible();

    // Select type of form
    const typeSelect = page.locator("select").first();
    await typeSelect.selectOption({ index: 1 });

    // Fill in description
    const descriptionTextarea = page.locator("textarea").first();
    await descriptionTextarea.fill("Test form description");

    // Click Continue and wait for the published page redirect
    await Promise.all([
      page.waitForURL(new RegExp(`/form-builder/${formId}/published`), {
        timeout: 60000,
      }),
      page.locator("dialog").getByRole("button", { name: "Publish" }).click(),
    ]);

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(new RegExp(`/form-builder/${formId}/published`));
    await expect(page.getByRole("heading", { name: "Your form is published" })).toBeVisible();

    // Open the published form from the Forms page and create a new draft version.
    await page.goto("/en/forms?status=published");
    const formCard = page.getByTestId(`card-${formId}`);
    await expect(formCard).toBeVisible();
    await expect(formCard.getByText("Published- version 1")).toBeVisible();

    const moreButton = formCard.getByRole("button", { name: /^Menu for form / });
    await expect(moreButton).toHaveAttribute("popovertarget", `menu-${formId}`);
    await moreButton.click();
    const formMenu = formCard.getByRole("menu");
    await expect(formMenu).toBeVisible();
    await formMenu.getByRole("button", { name: "Edit published form" }).click();

    const createDraftDialog = page.getByRole("dialog");
    await expect(
      createDraftDialog.getByRole("heading", { name: "Update published form" })
    ).toBeVisible();
    await createDraftDialog.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(new RegExp(`/form-builder/${formId}/edit$`));

    // Verify that editing the published form created the next draft version.
    await page.goto("/en/forms?status=published");
    const publishedFormCard = page.getByTestId(`card-${formId}`);
    await expect(publishedFormCard.getByText("Draft - version 2")).toBeVisible();
    await publishedFormCard.getByText("Draft - version 2").click();
    await page.waitForURL(new RegExp(`/form-builder/${formId}/edit$`));

    // Make a known question edit and save the draft.
    const updatedQuestion = "Updated published form question";
    const questionInput = page.locator("#item-1");
    await questionInput.fill(updatedQuestion);
    await expect(questionInput).toHaveValue(updatedQuestion);

    await page.waitForTimeout(2100);
    const saveDraftButton = page.getByRole("button", { name: "Save draft" });
    await expect(saveDraftButton).toBeVisible();
    await saveDraftButton.click();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible({ timeout: 15000 });

    // Republish the updated draft.
    const publishMenuButton = page.locator("header").getByRole("button", { name: "Publish" });
    await publishMenuButton.click();
    await page.getByRole("button", { name: "Ready to publish" }).click();

    const republishDialog = page.getByRole("dialog");
    await expect(
      republishDialog.getByRole("heading", { name: "Publish updated form" })
    ).toBeVisible();
    await republishDialog.locator('input[name="template-category"]').first().check({ force: true });
    await republishDialog.getByRole("button", { name: "Continue" }).click();
    await republishDialog.locator("#confirmation-agree").fill("AGREE");

    await Promise.all([
      page.waitForURL(new RegExp(`/form-builder/${formId}/published$`), { timeout: 60000 }),
      republishDialog.getByRole("button", { name: "Publish update" }).click(),
    ]);

    // Confirm the live form uses the republished content.
    await page.goto(`/en/id/${formId}`);
    await expect(page.locator("#label-1")).toHaveText(updatedQuestion);
  });
});
