import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BrowserResponsesAppProvider } from "../context/BrowserResponsesAppProvider";
import { ResponsesProvider } from "../context/ResponsesContext";
import { SelectApiKey } from "../load-key/SelectApiKey";
import { ContentWrapper } from "../ContentWrapper";
import { PilotBadge } from "@clientComponents/globals/PilotBadge";
import { setupFonts, visualWait, isVisualDebugMode } from "./testHelpers";

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

// Helper to render the component with standard wrapper
function renderSelectApiKey(overrides?: Parameters<typeof BrowserResponsesAppProvider>[0]["overrides"]) {
  return render(
    <BrowserResponsesAppProvider overrides={overrides}>
      <ResponsesProvider locale="en" formId="test-form">
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
    await new Promise(resolve => setTimeout(resolve, isVisualDebugMode() ? 4000 : 500));

    expect(filePickerOpened).toBe(true);

    await visualWait(3000);
  }, 15000);
});
