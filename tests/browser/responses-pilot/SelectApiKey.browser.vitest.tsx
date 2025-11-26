import { describe, it, expect, beforeAll } from "vitest";
import { page } from "@vitest/browser/context";
import { SelectApiKey } from "@responses-pilot/load-key/SelectApiKey";
import { render } from "./testUtils";
import { GCFormsApiClient } from "@responses-pilot/lib/apiClient";
import { setupFonts } from "./testHelpers";

import "@root/styles/app.scss";

describe("SelectApiKey - Browser Mode", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("should verify switch link exists", async () => {
    await render(<SelectApiKey locale="en" id="test-form" />);

    // Check that the switch back link shows translated text, not the key
    const switchLink = page.getByTestId("responses-pilot-switch-back-link");
    await expect.element(switchLink).toBeInTheDocument();

    // Get the actual text content
    const linkElement = await switchLink.element();
    const textContent = linkElement.textContent;

    // Should show translated text
    expect(textContent).toBe("Switch back to the classic Responses view");
    // Should NOT show the translation key
    expect(textContent).not.toBe("responsesPilot.responsesSwitchLink");
  });

  it("should render the load key page", async () => {
    await render(<SelectApiKey locale="en" id="test-form" />);

    // Check for step indicator
    await expect.element(page.getByTestId("step-indicator")).toBeInTheDocument();
    await expect.element(page.getByTestId("step-indicator")).toHaveTextContent("Step 1 of 3");

    // Check for heading
    await expect.element(page.getByTestId("load-key-heading")).toBeInTheDocument();
    await expect
      .element(page.getByTestId("load-key-heading"))
      .toHaveTextContent("Select your API key file");
  });

  it("should have Continue button disabled initially", async () => {
    await render(<SelectApiKey locale="en" id="test-form" />);

    await expect.element(page.getByTestId("continue-button")).toBeDisabled();
  });

  it("should show 'Lost your key?' link and open popover on click", async () => {
    await render(<SelectApiKey locale="en" id="test-form" />);

    await expect.element(page.getByTestId("lost-key-link")).toBeInTheDocument();
    await page.getByTestId("lost-key-link").click();

    await expect.element(page.getByTestId("lost-key-popover")).toBeInTheDocument();
    await expect
      .element(page.getByTestId("lost-key-popover-title"))
      .toHaveTextContent("Don't have your API key?");
  });

  it("should open file picker when clicking Upload API Key", async () => {
    let filePickerOpened = false;
    const mockShowOpenFilePicker = async () => {
      filePickerOpened = true;
      throw new DOMException("User cancelled", "AbortError");
    };

    await render(<SelectApiKey locale="en" id="test-form" />, {
      overrides: { showOpenFilePicker: mockShowOpenFilePicker },
    });

    await page.getByTestId("load-api-key-button").click();

    expect(filePickerOpened).toBe(true);
  });

  describe("When API client exists", () => {
    it("should hide load key UI when API client is set", async () => {
      const mockApiClient = {
        getNewFormSubmissions: async () => [],
        formId: "test-form",
      } as unknown as GCFormsApiClient;

      await render(<SelectApiKey locale="en" id="test-form" />, { mockApiClient });

      // Load key button should not be visible
      const loadKeyButton = document.querySelector('[data-testid="load-api-key-button"]');
      expect(loadKeyButton).toBeNull();

      await expect.element(page.getByTestId("no-responses")).toBeInTheDocument();
    });

    it("should show 'No new responses' when there are no submissions", async () => {
      const mockApiClient = {
        getNewFormSubmissions: async () => [],
        formId: "test-form",
      } as unknown as GCFormsApiClient;

      await render(<SelectApiKey locale="en" id="test-form" />, { mockApiClient });

      await expect.element(page.getByTestId("no-responses")).toBeInTheDocument();
      await expect.element(page.getByTestId("no-responses-heading")).toBeInTheDocument();
    });

    it("should show 'New responses available' when there are submissions", async () => {
      const mockApiClient = {
        getNewFormSubmissions: async () => {
          return [
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
          ];
        },
        formId: "test-form",
      } as unknown as GCFormsApiClient;

      await render(<SelectApiKey locale="en" id="test-form" />, { mockApiClient });

      await expect.element(page.getByTestId("responses-available")).toBeInTheDocument();
      await expect.element(page.getByTestId("new-responses-heading")).toBeInTheDocument();
    });
  });
});
