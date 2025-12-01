import { describe, it, expect, beforeAll, vi } from "vitest";
import { page } from "@vitest/browser/context";
import { Confirmation } from "@responses-pilot/result/Confirmation";
import { render } from "./testUtils";
import { GCFormsApiClient } from "@responses-pilot/lib/apiClient";
import { setupFonts } from "./testHelpers";
import enTranslations from "@root/i18n/translations/en/response-api.json";

import "@root/styles/app.scss";

describe("Confirmation - Browser Mode", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("should show success and downloaded responses count", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    const mockDirectoryHandle = {
      name: "my-responses-folder",
    };

    const mockProcessedSubmissionIds = new Set(["sub-1", "sub-2", "sub-3"]);

    await render(<Confirmation locale="en" id="test-form" />, {
      mockApiClient,
      overrides: {
        processedSubmissionIds: mockProcessedSubmissionIds,
        directoryHandle: mockDirectoryHandle,
      },
    });

    await expect.element(page.getByTestId("confirmation-page-title")).toBeInTheDocument();
    await expect
      .element(page.getByText(enTranslations.confirmationPage.successTitle))
      .toBeInTheDocument();

    // Should show "3 responses were downloaded"
    const message = page.getByText(/3 responses were downloaded/);
    await expect.element(message).toBeInTheDocument();

    const savedToText = page.getByText(enTranslations.confirmationPage.savedTo);
    await expect.element(savedToText).toBeInTheDocument();

    const dirName = page.getByText("/my-responses-folder");
    await expect.element(dirName).toBeInTheDocument();

    const checkButton = page.getByText(enTranslations.checkForNewResponsesButton);
    await expect.element(checkButton).toBeInTheDocument();
  });

  it("should show singular form for one response", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    const mockProcessedSubmissionIds = new Set(["sub-1"]);

    await render(<Confirmation locale="en" id="test-form" />, {
      mockApiClient,
      overrides: { processedSubmissionIds: mockProcessedSubmissionIds },
    });

    // Should show "1 response was downloaded"
    const message = page.getByText(/1 response was downloaded/);
    await expect.element(message).toBeInTheDocument();
  });

  it("should navigate to start when back button is clicked", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    const mockRouter = {
      push: vi.fn(),
    };

    const mockProcessedSubmissionIds = new Set(["sub-1", "sub-2", "sub-3"]);

    await render(<Confirmation locale="en" id="test-form" />, {
      mockApiClient,

      overrides: { router: mockRouter, processedSubmissionIds: mockProcessedSubmissionIds },
    });

    const backButton = page.getByText(enTranslations.backToStart);
    await backButton.click();

    expect(mockRouter.push).toHaveBeenCalledWith(
      "/en/form-builder/test-form/responses-pilot?reset=true"
    );
  });

  it("should show error title when error occurred with no downloads", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    const mockProcessedSubmissionIds = new Set<string>();

    await render(<Confirmation locale="en" id="test-form" />, {
      mockApiClient,
      overrides: {
        hasError: true,
        processedSubmissionIds: mockProcessedSubmissionIds,
      },
    });

    const errorTitle = page.getByText(enTranslations.confirmationPage.errorTitle);
    await expect.element(errorTitle).toBeInTheDocument();

    const errorMessage = page.getByText(enTranslations.confirmationPage.errorOccurred);
    await expect.element(errorMessage).toBeInTheDocument();
  });

  it("should show partial success title when error occurred with some downloads", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    const mockProcessedSubmissionIds = new Set(["sub-1", "sub-2"]);

    await render(<Confirmation locale="en" id="test-form" />, {
      mockApiClient,
      overrides: {
        hasError: true,
        processedSubmissionIds: mockProcessedSubmissionIds,
      },
    });

    const partialTitle = page.getByText(enTranslations.confirmationPage.partialSuccessTitle);
    await expect.element(partialTitle).toBeInTheDocument();

    // Should still show count
    const message = page.getByText(/2 responses were downloaded/);
    await expect.element(message).toBeInTheDocument();
  });

  it("should show malicious attachments warning when flagged", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    const mockProcessedSubmissionIds = new Set(["sub-1"]);

    await render(<Confirmation locale="en" id="test-form" />, {
      mockApiClient,
      overrides: {
        hasMaliciousAttachments: true,
        processedSubmissionIds: mockProcessedSubmissionIds,
      },
    });

    const title = page.getByText(enTranslations.confirmationPage.maliciousAttachmentsWarningTitle);
    await expect.element(title).toBeInTheDocument();

    const body = page.getByText(enTranslations.confirmationPage.maliciousAttachmentsWarningBody);
    await expect.element(body).toBeInTheDocument();
  });
});
