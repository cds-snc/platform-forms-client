import { describe, it, expect, beforeAll } from "vitest";
import { page } from "../vitestBrowserShim";
import { SelectFormat, STORAGE_KEY_PREFIX } from "@responses-pilot/format/SelectFormat";
import { render } from "./testUtils";
import { setupFonts } from "./testHelpers";
import { vi } from "vitest";
import { GCFormsApiClient } from "@responses-pilot/lib/apiClient";

import "@root/styles/app.scss";

describe("SelectFormat - Browser Mode", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("should render the format selection page", async () => {
    await render(<SelectFormat locale="en" id="test-form" />);

    // check step indicator
    await expect.element(page.getByTestId("step-indicator")).toBeInTheDocument();
    await expect.element(page.getByTestId("step-indicator")).toHaveTextContent("Step 3 of 3");

    await expect.element(page.getByTestId("format-page-title")).toBeInTheDocument();
  });

  it("should default to CSV when no localStorage exists", async () => {
    // Ensure no saved format exists
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}test-form`);

    await render(<SelectFormat locale="en" id="test-form" />);

    // CSV radio should be checked by default
    const csvRadio = page.getByTestId("format-csv");
    await expect.element(csvRadio).toBeChecked();

    // Continue button should be enabled
    await expect.element(page.getByTestId("continue-button")).toBeEnabled();
  });

  it("should load saved HTML format from localStorage", async () => {
    // Set HTML as the saved format in localStorage for this form
    localStorage.setItem(`${STORAGE_KEY_PREFIX}test-form`, "html");

    await render(<SelectFormat locale="en" id="test-form" />);

    // HTML radio should be checked
    const htmlRadio = page.getByTestId("format-html");
    await expect.element(htmlRadio).toBeChecked();

    // Continue button should be enabled
    await expect.element(page.getByTestId("continue-button")).toBeEnabled();

    // Clean up
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}test-form`);
  });

  it("should enable Continue when a format csv is selected", async () => {
    await render(<SelectFormat locale="en" id="test-form" />);

    // Select the CSV radio by test id
    await page.getByTestId("format-csv").click();

    await expect.element(page.getByTestId("continue-button")).toBeEnabled();
  });

   it("should enable Continue when a format html is selected", async () => {
    await render(<SelectFormat locale="en" id="test-form" />);

    // Select the HTML radio by test id
    await page.getByTestId("format-html").click();
    await expect.element(page.getByTestId("continue-button")).toBeEnabled();
  });



  it("should have a Back link pointing to location with reset param", async () => {
    await render(<SelectFormat locale="en" id="test-form" />);

    // The back link is a regular anchor with the expected href
    const backLink = document.querySelector(
      'a[href="/en/form-builder/test-form/responses-pilot/location?reset=true"]'
    );

    expect(backLink).not.toBeNull();
  });

  it("should call retrieveResponses and navigate when Continue is pressed", async () => {
    // Mock API client to return a single submission
    const mockClient = {
      getNewFormSubmissions: async () => [{ name: "submission-1" }],
      getFormTemplate: async () => ({}),
      getFormId: () => "test-form-id",
    } as unknown as GCFormsApiClient;

    // Spy for router.push
    const pushSpy = vi.fn();

    await render(<SelectFormat locale="en" id="test-form" />, {
      mockApiClient: mockClient,
      overrides: {
        router: { push: pushSpy, replace: () => {}, back: () => {}, forward: () => {}, refresh: () => {}, prefetch: async () => {} },
      },
    });

    // Select a format to enable Continue
    await page.getByTestId("format-csv").click();

    // Click continue
    await page.getByTestId("continue-button").click();

    // Expect router.push called with processing route
    expect(pushSpy).toHaveBeenCalledWith("/en/form-builder/test-form/responses-pilot/processing");
  });
});
