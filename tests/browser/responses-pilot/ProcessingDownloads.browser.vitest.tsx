import { describe, it, expect, beforeAll, vi } from "vitest";
import { page } from "@vitest/browser/context";
import { ProcessingDownloads } from "@responses-pilot/processing/ProcessingDownloads";
import { render } from "./testUtils";
import { GCFormsApiClient } from "@responses-pilot/lib/apiClient";
import { setupFonts } from "./testHelpers";
import enTranslations from "@root/i18n/translations/en/response-api.json";

import "@root/styles/app.scss";

describe("ProcessingDownloads - Browser Mode", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("should render the processing page with title", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    await render(<ProcessingDownloads locale="en" id="test-form" />, { mockApiClient });

    await expect.element(page.getByTestId("processing-page-title")).toBeInTheDocument();
    await expect
      .element(page.getByTestId("processing-page-title"))
      .toHaveTextContent(enTranslations.processingPage.processingTitle);
  });

  it("should show please wait message when no submission is being processed", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    await render(<ProcessingDownloads locale="en" id="test-form" />, { mockApiClient });

    const message = page.getByText(enTranslations.processingPage.pleaseWait);
    await expect.element(message).toBeInTheDocument();
  });

  it("should show cancel button", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    await render(<ProcessingDownloads locale="en" id="test-form" />, { mockApiClient });

    const cancelButton = page.getByText("Pause download");
    await expect.element(cancelButton).toBeInTheDocument();
  });

  it("should show loader icon", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    await render(<ProcessingDownloads locale="en" id="test-form" />, { mockApiClient });

    // Loader should be present (MapleLeafLoader component)
    const loaderContainer = document.querySelector("svg");
    expect(loaderContainer).not.toBeNull();
  });

  it("should have live region with polite and status role", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    await render(<ProcessingDownloads locale="en" id="test-form" />, { mockApiClient });

    const liveRegion = document.querySelector('[aria-live="polite"][role="status"]');
    expect(liveRegion).not.toBeNull();
  });

  it("should call router push when cancel button is clicked", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    const mockRouter = {
      push: vi.fn(),
    };

    await render(<ProcessingDownloads locale="en" id="test-form" />, {
      mockApiClient,
      overrides: { router: mockRouter },
    });

    const cancelButton = page.getByText("Pause download");
    await cancelButton.click();

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Router should be called to navigate to result page
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/en/form-builder/test-form/responses-pilot/result"
    );
  });

  it("should disable cancel button when navigating", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    const mockRouter = {
      push: vi.fn(),
    };

    await render(<ProcessingDownloads locale="en" id="test-form" />, {
      mockApiClient,
      overrides: { router: mockRouter },
    });

    const cancelButton = page.getByText("Pause download");
    await cancelButton.click();

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Button should be disabled
    await expect.element(cancelButton).toBeDisabled();
  });

  it("should display current submission id when processing", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    // Mock the context to provide a currentSubmissionId
    const mockCurrentSubmissionId = "test-submission-123";

    await render(<ProcessingDownloads locale="en" id="test-form" />, {
      mockApiClient,
      overrides: { currentSubmissionId: mockCurrentSubmissionId },
    });

    // Should show the submission id in the message
    const message = page.getByText(/Processing submission test-submission-123/);
    await expect.element(message).toBeInTheDocument();

    // Screen reader text should still say "Please wait..."
    const srOnlyText = document.querySelector(".sr-only");
    expect(srOnlyText?.textContent).toBe("Please wait...");
  });
});
