import { describe, it, expect, beforeAll, vi } from "vitest";
import { page } from "@vitest/browser/context";
import { SelectLocation } from "@responses-pilot/location/SelectLocation";
import { render } from "./testUtils";
import { setupFonts } from "./testHelpers";

import "@root/styles/app.scss";

// Mock the native-file-system-adapter module
vi.mock("native-file-system-adapter", async () => {
  const actual = await vi.importActual("native-file-system-adapter");
  return {
    ...actual,
    showDirectoryPicker: vi.fn(),
  };
});

describe("SelectLocation - Browser Mode", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("should render the location selection page", async () => {
    await render(<SelectLocation locale="en" id="test-form" />);

    // Check for step indicator
    await expect.element(page.getByTestId("step-indicator")).toBeInTheDocument();
    await expect.element(page.getByTestId("step-indicator")).toHaveTextContent("Step 2 of 3");

    // Check for title
    const title = page.getByTestId("location-page-title");
    await expect.element(title).toBeInTheDocument();
  });

  it("should display the directory picker when no directory is selected", async () => {
    await render(<SelectLocation locale="en" id="test-form" />);

    // Check for directory picker button
    const pickerButton = page.getByTestId("choose-location-button");
    await expect.element(pickerButton).toBeInTheDocument();
  });

  it("should have Continue button disabled initially", async () => {
    await render(<SelectLocation locale="en" id="test-form" />);

    const continueButton = page.getByTestId("continue-button");
    await expect.element(continueButton).toBeInTheDocument();
    await expect.element(continueButton).toBeDisabled();
  });

  it("should have a Back button that links to load-key with reset", async () => {
    await render(<SelectLocation locale="en" id="test-form" />);

    const backButton = page.getByTestId("back-button");
    await expect.element(backButton).toBeInTheDocument();
    await expect
      .element(backButton)
      .toHaveAttribute("href", "/en/form-builder/test-form/responses-pilot/load-key?reset=true");
  });

  it("should show toast when directory is selected and focused on Continue button", async () => {
    const { showDirectoryPicker } = await import("native-file-system-adapter");
    
    // Mock the directory picker to return a mock handle that exposes
    // permission APIs so verifyPermission() returns granted.
    vi.mocked(showDirectoryPicker).mockResolvedValueOnce({
      name: "test-directory",
      kind: "directory",
      getDirectoryHandle: vi.fn().mockResolvedValue({}),
      queryPermission: vi.fn().mockResolvedValue("granted"),
      requestPermission: vi.fn().mockResolvedValue("granted"),
    } as never);

    await render(<SelectLocation locale="en" id="test-form" />);

    const pickerButton = page.getByTestId("choose-location-button");
    await pickerButton.click();

    // Wait for toast to appear
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check for toast message
    const toast = page.getByText(/test-directory/i);
    await expect.element(toast).toBeInTheDocument();

    // Ensure Continue is focused after selection
    const continueButton = page.getByTestId("continue-button");
    await expect.element(continueButton).toHaveFocus();
  });

  it("should show permission denied toast when permission is denied", async () => {
    const { showDirectoryPicker } = await import("native-file-system-adapter");

    // Mock the directory picker to return a handle that denies permissions
    vi.mocked(showDirectoryPicker).mockResolvedValueOnce({
      name: "denied-directory",
      kind: "directory",
      getDirectoryHandle: vi.fn().mockResolvedValue({}),
      queryPermission: vi.fn().mockResolvedValue("denied"),
      requestPermission: vi.fn().mockRejectedValue(new Error("NotAllowedError")),
    } as never);

    await render(<SelectLocation locale="en" id="test-form" />);

    const pickerButton = page.getByTestId("choose-location-button");
    await pickerButton.click();

    // Wait for toast to appear
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check for permission denied toast message
    const toast = page.getByText(/unable to modify folder contents|permission denied/i);
    await expect.element(toast).toBeInTheDocument();
  });
});
