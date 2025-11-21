import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BrowserResponsesAppProvider } from "../context/BrowserResponsesAppProvider";
import { ResponsesProvider, useResponsesContext } from "../context/ResponsesContext";
import { SelectApiKey } from "../load-key/SelectApiKey";
import { ContentWrapper } from "../ContentWrapper";
import { PilotBadge } from "@clientComponents/globals/PilotBadge";
import { setupFonts, visualWait } from "./testHelpers";
import { GCFormsApiClient } from "../lib/apiClient";
import { useEffect } from "react";

// Import actual app styles
import "@root/styles/app.scss";

/**
 * Browser mode tests for SelectApiKey component
 * Run with: yarn test:vitest:browser
 * 
 * These tests render the actual SelectApiKey component in a real browser (Chromium)
 * to verify visual appearance and interactions.
 * 
 * The context/index.ts barrel file ensures SelectApiKey uses BrowserResponsesAppProvider
 * when VITEST_BROWSER=true, giving it mock router, searchParams, t, and i18n.
 */

// Component that sets API client on mount
function ApiClientSetter({ mockClient }: { mockClient: GCFormsApiClient }) {
  const { setApiClient } = useResponsesContext();
  
  useEffect(() => {
    setApiClient(mockClient);
  }, [mockClient, setApiClient]);
  
  return null;
}

// Helper to render the component with standard wrapper
function renderSelectApiKey(
  overrides?: Parameters<typeof BrowserResponsesAppProvider>[0]["overrides"],
  mockClient?: GCFormsApiClient
) {
  return render(
    <BrowserResponsesAppProvider overrides={overrides}>
      <ResponsesProvider locale="en" formId="test-form">
        {mockClient && <ApiClientSetter mockClient={mockClient} />}
        <h1 className="mb-4">Responses</h1>
        <PilotBadge className="mb-8" />
        <ContentWrapper>
          <SelectApiKey locale="en" id="test-form" />
        </ContentWrapper>
      </ResponsesProvider>
    </BrowserResponsesAppProvider>
  );
}

describe("SelectApiKey - Browser Mode", () => {
  it("should render the load key page", async () => {
    setupFonts();

    const { container } = renderSelectApiKey();

    // Verify component renders
    expect(container).toBeTruthy();
    
    await visualWait(5000);
  }, 10000);

  it("should have Continue button disabled initially", async () => {
    setupFonts();

    const { findByTestId } = renderSelectApiKey();

    const continueButton = (await findByTestId("continue-button")) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(true);

    await visualWait(3000);
  }, 10000);

  it("should show 'Lost your key?' link", async () => {
    setupFonts();

    const { findByTestId } = renderSelectApiKey();

    const lostKeyLink = await findByTestId("lost-key-link");
    expect(lostKeyLink).toBeTruthy();

    await visualWait(3000);
  }, 10000);

  it("should open file picker when clicking Upload API Key", async () => {
    setupFonts();

    let filePickerOpened = false;
    const mockShowOpenFilePicker = async () => {
      filePickerOpened = true;
      throw new DOMException("User cancelled", "AbortError");
    };

    const { findByTestId } = renderSelectApiKey({ showOpenFilePicker: mockShowOpenFilePicker });

    const uploadButton = await findByTestId("load-api-key-button");
    uploadButton.click();

    // Wait for the click to process
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(filePickerOpened).toBe(true);

    await visualWait(3000);
  }, 15000);

  describe("When API client exists", () => {
    it("should hide load key UI when API client is set", async () => {
      setupFonts();

      // Mock API client that returns empty array quickly
      const mockApiClient = {
        getNewFormSubmissions: async () => [],
        formId: "test-form",
      } as unknown as GCFormsApiClient;

      const { queryByTestId, findByTestId } = renderSelectApiKey(undefined, mockApiClient);

      // Load key button should not be visible
      const loadKeyButton = queryByTestId("load-api-key-button");
      expect(loadKeyButton).toBeFalsy();

      // Should show no responses section
      await findByTestId("no-responses");

      await visualWait(3000);
    }, 15000);

    it("should show 'No new responses' when there are no submissions", async () => {
      setupFonts();

      // Mock API client that returns empty array
      const mockApiClient = {
        getNewFormSubmissions: async () => [],
        formId: "test-form",
      } as unknown as GCFormsApiClient;

      const { findByTestId } = renderSelectApiKey(undefined, mockApiClient);

      // Should show no responses section with heading
      const noResponsesSection = await findByTestId("no-responses");
      expect(noResponsesSection).toBeTruthy();

      const noResponsesHeading = await findByTestId("no-responses-heading");
      expect(noResponsesHeading).toBeTruthy();

      await visualWait(5000);
    }, 15000);

    it("should show 'New responses available' when there are submissions", async () => {
      setupFonts();

      // Mock API client that returns submissions
      const mockApiClient = {
        getNewFormSubmissions: async () => [
          {
            confirmationCode: "TEST-123",
            createdAt: new Date().toISOString(),
            name: "Test Submission",
          },
          {
            confirmationCode: "TEST-456",
            createdAt: new Date().toISOString(),
            name: "Test Submission 2",
          },
        ],
        formId: "test-form",
      } as unknown as GCFormsApiClient;

      const { findByTestId } = renderSelectApiKey(undefined, mockApiClient);

      // Should show responses available section with heading
      const responsesSection = await findByTestId("responses-available");
      expect(responsesSection).toBeTruthy();

      const newResponsesHeading = await findByTestId("new-responses-heading");
      expect(newResponsesHeading).toBeTruthy();

      await visualWait(5000);
    }, 15000);
  });
});
