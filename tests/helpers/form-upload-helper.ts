import { Page } from "@playwright/test";
import path from "path";

export class FormUploadHelper {
  constructor(private page: Page) {}

  async uploadFormFixture(fixtureName: string): Promise<string> {
    // Navigate to form builder start page
    await this.page.goto("/en/form-builder");

    // Wait for the page to load
    await this.page.waitForLoadState("networkidle");

    // Upload the JSON fixture file to the hidden input
    const fixturePath = path.join(__dirname, "../../__fixtures__", `${fixtureName}.json`);

    // Set the file on the hidden input - this will trigger handleChange
    await this.page.setInputFiles("#file-upload", fixturePath);

    // Wait for the automatic navigation to preview page that happens in Start.tsx
    // router.push(`/${language}/form-builder/0000/preview`) is called after importTemplate
    await this.page.waitForURL(/\/form-builder\/0000\/preview/, { timeout: 15000 });

    // Wait for the page to fully load after navigation
    await this.page.waitForLoadState("networkidle");

    // Wait for the form content to actually load - try multiple possible selectors
    await this.page.waitForSelector(
      'form, [data-testid="form-content"], .gc-form-wrapper, main, h1',
      { timeout: 10000 }
    );

    // Return the temp form ID used during editing
    return "0000";
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
}
