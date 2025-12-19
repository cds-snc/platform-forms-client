import { Page } from "@playwright/test";
import path from "path";

export class FormUploadHelper {
  constructor(private page: Page) {}

  async uploadFormFixture(fixtureName: string, previewOnly: boolean = false): Promise<string> {
    // Navigate to form builder start page
    await this.page.goto("/en/form-builder");

    // Wait for the page to load
    await this.page.waitForLoadState("networkidle");

    // Upload the JSON fixture file to the hidden input
    const fixturePath = path.join(__dirname, "../../__fixtures__", `${fixtureName}.json`);

    // Set the file on the hidden input - this will trigger handleChange
    await this.page.setInputFiles("#file-upload", fixturePath);

    // Wait for the automatic navigation to preview page first
    await this.page.waitForURL(/\/form-builder\/0000\/preview/, { timeout: 15000 });

    // Wait for the page to fully load
    await this.page.waitForLoadState("networkidle");

    if (previewOnly) {
      return "0000";
    }

    // Click on the edit link in the left navigation using the testid
    const editLink = this.page.locator('[data-testid="edit"]');
    await editLink.click();

    // Wait for navigation to edit page
    await this.page.waitForURL(/\/form-builder\/0000\/edit/, { timeout: 15000 });
    await this.page.waitForLoadState("networkidle");

    // Make a small edit to trigger save draft - add !! to the form title
    // This will cause the form to be saved and get a real ID
    const formTitle = this.page.locator("#formTitle");
    await formTitle.click();
    await formTitle.type("!");
    await formTitle.press("Backspace"); // Trigger change to enable save

    // Wait for the Save Draft button to appear
    await this.page.waitForTimeout(500);

    // Scroll the Save Draft button into view and press Enter
    const saveDraftButton = this.page.getByText("Save draft");
    await saveDraftButton.waitFor({ state: "visible", timeout: 10000 });
    await saveDraftButton.scrollIntoViewIfNeeded();
    await saveDraftButton.focus();
    await this.page.keyboard.press("Enter");

    // Wait for the "Saved" text to appear (from the SaveButton component)
    // This confirms the save completed successfully
    await this.page.locator("span.text-slate-500", { hasText: /saved/i }).waitFor({
      state: "visible",
      timeout: 15000,
    });

    // Wait a bit more for the nav links to update with the real form ID
    await this.page.waitForTimeout(1000);

    // Get the real form ID from the edit link in the left nav
    const editLinkHref = await this.page.locator('[data-testid="edit"]').getAttribute("href");
    if (!editLinkHref) {
      throw new Error("Could not find edit link href");
    }

    const formIdMatch = editLinkHref.match(/\/form-builder\/([a-z0-9]+)\//);
    if (!formIdMatch) {
      throw new Error("Could not extract form ID from edit link");
    }
    const formId = formIdMatch[1];

    // Verify we don't have the temp ID
    if (formId === "0000") {
      throw new Error("Still have temporary form ID, save draft may not have completed");
    }

    // Wait for the form content to actually load
    await this.page.waitForSelector(
      'form, [data-testid="form-content"], .gc-form-wrapper, main, h1',
      { timeout: 10000 }
    );

    // Return the actual form ID
    return formId;
  }

  async visitFormPreview(): Promise<void> {
    // Navigate to the form preview page (works without auth)
    await this.page.goto("/en/form-builder/0000/preview");
    await this.page.waitForLoadState("networkidle");

    // Wait for form content to load
    await this.page.waitForSelector('form, [data-testid="form-content"], h1', { timeout: 10000 });
  }

  async visitForm(): Promise<void> {
    // Navigate to the form preview page since it's the public accessible version
    // The preview page shows the actual form functionality for testing
    await this.page.goto("/en/form-builder/0000/preview");
    await this.page.waitForLoadState("networkidle");

    // Wait for form elements to be present
    await this.page.waitForSelector('form, [data-testid="form-content"], h1', { timeout: 10000 });
  }

  async stayInBuilder(): Promise<void> {
    // Stay in the builder context where the form is already loaded
    // This might be more reliable than navigating to preview
    await this.page.waitForSelector('form, [data-testid="form-content"], h1', { timeout: 10000 });
  }

  async navigateToFormView(): Promise<void> {
    // Try to navigate to the form view within the builder
    // Look for a "Preview" or "View Form" button and click it
    const previewButton = this.page.getByRole("button", { name: /preview|view form/i });
    const previewButtonExists = await previewButton.isVisible().catch(() => false);

    if (previewButtonExists) {
      await previewButton.click();
      await this.page.waitForLoadState("networkidle");
    }

    // Wait for form content to load
    await this.page.waitForSelector('form, [data-testid="form-content"], h1', { timeout: 10000 });
  }

  async ensureFormIsLoaded(): Promise<void> {
    // Simple method to ensure we're on a page with form content
    // This can be called after upload to verify the form is ready for testing
    await this.page.waitForSelector(
      'form, [data-testid="form-content"], .gc-form-wrapper, main, h1',
      { timeout: 10000 }
    );
  }

  async visitPublicForm(formId: string = "0000"): Promise<void> {
    // Try the public form URL pattern (if it exists)
    // This might be /en/forms/{id} or similar - adjust based on your app's routing
    await this.page.goto(`/en/forms/${formId}`);
    await this.page.waitForLoadState("networkidle");
  }

  async publishForm(formId: string) {
    // Navigate to settings page
    await this.page.goto(`/en/form-builder/${formId}/settings`);
    await this.page.waitForLoadState("networkidle");

    // Wait for settings page to be ready
    await this.page.waitForTimeout(1000);

    // We should already be on the settings page, but wait for the Intended Use section
    const intendedUseHeading = this.page.getByRole("heading", { name: "Intended use" });
    await intendedUseHeading.waitFor({ state: "visible", timeout: 10000 });

    // Scroll to the Intended Use section
    await intendedUseHeading.scrollIntoViewIfNeeded();

    // Click the first radio button (admin purpose) using the ID
    const intendedUseRadio = this.page.locator("input#purposeAndUseAdmin");
    await intendedUseRadio.scrollIntoViewIfNeeded();
    await intendedUseRadio.waitFor({ state: "visible", timeout: 5000 });
    await intendedUseRadio.check({ force: true });
    await this.page.waitForTimeout(1000); // Auto-save delay

    // Navigate to publish page
    await this.page.goto(`/en/form-builder/${formId}/publish`);

    // Click the Publish button to open the dialog
    const publishButton = this.page.getByRole("button", { name: /publish/i });

    if (await publishButton.isVisible()) {
      await publishButton.click();
      await this.page.waitForTimeout(2000);
    }

    // Fill in the "Publish form"
    const publishDialog = this.page.getByRole("heading", { name: "Publish form" });
    if (await publishDialog.isVisible()) {
      // Select a reason for publishing (first radio button)
      const reasonRadio = this.page.locator('input[type="radio"]').first();
      await reasonRadio.click();

      // Click Continue to publish
      await this.page.getByRole("button", { name: "Continue" }).click();
      await this.page.waitForLoadState("networkidle");
    }

    // Fill in "Tell us more about your form"
    const tellUsMoreDialog = this.page.getByRole("heading", {
      name: "Tell us more about your form",
    });

    if (await tellUsMoreDialog.isVisible()) {
      // Select type of form
      const typeSelect = this.page.locator("select").first();
      await typeSelect.selectOption({ index: 1 }); // Select first non-empty option

      // Fill in description
      const descriptionTextarea = this.page.locator("textarea").first();
      await descriptionTextarea.fill("Test form description");

      // Click Continue
      await this.page.getByRole("button", { name: "Continue" }).click();
    }

    // Wait for the redirect to the published page (may take longer)
    await this.page.waitForURL(new RegExp(`/form-builder/${formId}/published`), {
      timeout: 60000,
    });
    await this.page.waitForLoadState("networkidle");
  }
}
