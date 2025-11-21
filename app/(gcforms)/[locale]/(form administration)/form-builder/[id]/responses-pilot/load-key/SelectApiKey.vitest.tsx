import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SelectApiKey } from "./SelectApiKey";
import { ResponsesProvider } from "../context/ResponsesContext";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { FileSystemFileHandle } from "native-file-system-adapter";

// @vitest-environment jsdom

// Mock modules with vi.fn() directly to avoid hoisting issues
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn().mockReturnValue(null),
  })),
}));

vi.mock("@i18n/client", () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  })),
}));

vi.mock("../lib/utils", () => ({
  getAccessTokenFromApiKey: vi.fn(),
}));

vi.mock("native-file-system-adapter", () => ({
  showOpenFilePicker: vi.fn(),
  showDirectoryPicker: vi.fn(),
}));

// Import after mocks to get mocked versions
import { useRouter, useSearchParams } from "next/navigation";
import { getAccessTokenFromApiKey } from "../lib/utils";
import { showOpenFilePicker } from "native-file-system-adapter";

type AppRouterInstance = ReturnType<typeof useRouter>;

describe("SelectApiKey - Logic Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default mock implementations
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    } as unknown as ReadonlyURLSearchParams);
  });

  it("should handle successful API key loading", async () => {
    const mockFile = {
      text: vi.fn().mockResolvedValue(
        JSON.stringify({
          formId: "test-form",
          key: "test-private-key",
          publicKey: "test-public-key",
        })
      ),
    };

    const mockFileHandle: Partial<FileSystemFileHandle> = {
      getFile: vi.fn().mockResolvedValue(mockFile),
      name: "test-key.json",
      kind: "file",
    };

    vi.mocked(showOpenFilePicker).mockResolvedValue([mockFileHandle as FileSystemFileHandle]);
    vi.mocked(getAccessTokenFromApiKey).mockResolvedValue("test-token");

    render(
      <ResponsesProvider locale="en" formId="test-form">
        <SelectApiKey locale="en" id="test-form" />
      </ResponsesProvider>
    );

    const loadButton = screen.getByRole("button", { name: /loadKeyPage.chooseFileButton/i });
    fireEvent.click(loadButton);

    await waitFor(() => {
      expect(showOpenFilePicker).toHaveBeenCalled();
      expect(getAccessTokenFromApiKey).toHaveBeenCalledWith({
        formId: "test-form",
        key: "test-private-key",
        publicKey: "test-public-key",
      });
    }, { timeout: 3000 });
  });

  it("should handle user cancellation (AbortError)", async () => {
    const abortError = new DOMException("User cancelled", "AbortError");
    vi.mocked(showOpenFilePicker).mockRejectedValue(abortError);

    render(
      <ResponsesProvider locale="en" formId="test-form">
        <SelectApiKey locale="en" id="test-form" />
      </ResponsesProvider>
    );

    const loadButton = screen.getByRole("button", { name: /loadKeyPage.chooseFileButton/i });
    fireEvent.click(loadButton);

    await waitFor(() => {
      expect(showOpenFilePicker).toHaveBeenCalled();
    });

    // Should remain on load key page
    expect(screen.getByText("loadKeyPage.title")).toBeInTheDocument();
  });

  it("should handle invalid JSON in key file", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const mockFile = {
      text: vi.fn().mockResolvedValue("invalid json {"),
    };

    const mockFileHandle: Partial<FileSystemFileHandle> = {
      getFile: vi.fn().mockResolvedValue(mockFile),
      name: "invalid-key.json",
      kind: "file",
    };

    vi.mocked(showOpenFilePicker).mockResolvedValue([mockFileHandle as FileSystemFileHandle]);

    render(
      <ResponsesProvider locale="en" formId="test-form">
        <SelectApiKey locale="en" id="test-form" />
      </ResponsesProvider>
    );

    const loadButton = screen.getByRole("button", { name: /loadKeyPage.chooseFileButton/i });
    fireEvent.click(loadButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error loading API key:",
        expect.any(SyntaxError)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("should reset state when reset param is true", async () => {
    const mockReplace = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: mockReplace,
    } as unknown as AppRouterInstance);
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue("true"),
    } as unknown as ReadonlyURLSearchParams);

    render(
      <ResponsesProvider locale="en" formId="test-form">
        <SelectApiKey locale="en" id="test-form" />
      </ResponsesProvider>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/en/form-builder/test-form/responses-pilot/load-key");
    });
  });

  it("should handle file read errors", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const mockFile = {
      text: vi.fn().mockRejectedValue(new Error("Failed to read file")),
    };

    const mockFileHandle: Partial<FileSystemFileHandle> = {
      getFile: vi.fn().mockResolvedValue(mockFile),
      name: "unreadable-key.json",
      kind: "file",
    };

    vi.mocked(showOpenFilePicker).mockResolvedValue([mockFileHandle as FileSystemFileHandle]);

    render(
      <ResponsesProvider locale="en" formId="test-form">
        <SelectApiKey locale="en" id="test-form" />
      </ResponsesProvider>
    );

    const loadButton = screen.getByRole("button", { name: /loadKeyPage.chooseFileButton/i });
    fireEvent.click(loadButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error loading API key:",
        expect.objectContaining({
          message: "Failed to read file",
        })
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
