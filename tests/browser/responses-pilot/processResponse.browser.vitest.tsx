import { describe, it, expect } from "vitest";
import { page } from "../vitestBrowserShim";
import type { SubmissionFixture } from "@responses-pilot/lib/__tests__/testHelpers";
import InMemoryDirectoryHandle from "@responses-pilot/lib/__tests__/fsMock";
import submissionFixture from "@responses-pilot/lib/__tests__/fixtures/response-get-support.json";
import templateFixture from "@responses-pilot/lib/__tests__/fixtures/template-get-support-cmeaj61dl0001xf01aja6mnpf.json";
import type { GCFormsApiClient } from "@responses-pilot/lib/apiClient";
import type { ResponseDownloadLogger } from "@responses-pilot/lib/logger";
import type { FormProperties } from "@root/lib/types";
import type {
  FileSystemDirectoryHandle,
  FileSystemFileHandle,
} from "native-file-system-adapter";
import type React from "react";

// Local stub for i18next `t` to avoid importing testHelpers (which uses Node crypto)
const defaultT = ((k: string) => k) as import("i18next").TFunction;

describe("processResponse -> browser injection", () => {
  it("renders response HTML ", async () => {
    // Use fixtures from the repository (same fixtures used by the node unit test)
    const submission = submissionFixture as unknown as SubmissionFixture;
    const template = templateFixture as unknown as FormProperties;

    // Prepare a minimal in-memory environment without importing Node-only helpers
    const dir = new InMemoryDirectoryHandle();
    const formTemplate = template;

    const mockApiClient = {
      getFormSubmission: async (_name: string) => ({} as unknown),
      confirmFormSubmission: async () => {},
      getFormTemplate: async () => formTemplate,
      getFormId: () => "test-form",
      getNewFormSubmissions: async () => [],
    } as unknown as GCFormsApiClient;

    const logger: Partial<ResponseDownloadLogger> = {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      // methods on the actual class that aren't used by this test
      setDirectoryHandle: () => {},
      flush: async () => {},
    };

    // Mock decryptFormSubmission and md5 so processResponse can run in this environment
    const { vi } = await import("vitest");

    const serializedSubmission = JSON.stringify({
      answers: submission.answers,
      checksum: "dummy-checksum",
      confirmationCode: submission.confirmationCode,
      attachments: [],
      createdAt: new Date().toISOString(),
    });

    vi.doMock("@responses-pilot/lib/utils", () => ({
      decryptFormSubmission: async () => serializedSubmission,
    }));

    vi.doMock("hash-wasm", () => ({ md5: async () => "dummy-checksum" }));

    // Import processResponse after setting up module mocks
    const { processResponse } = await import("@responses-pilot/lib/processResponse");

    const setProcessedSubmissionIds: React.Dispatch<React.SetStateAction<Set<string>>> = () => {};
    const setHasMaliciousAttachments: React.Dispatch<React.SetStateAction<boolean>> = () => {};

    const opts: {
      setProcessedSubmissionIds: React.Dispatch<React.SetStateAction<Set<string>>>;
      setHasMaliciousAttachments: React.Dispatch<React.SetStateAction<boolean>>;
      workingDirectoryHandle: FileSystemDirectoryHandle;
      htmlDirectoryHandle: FileSystemDirectoryHandle | null;
      csvFileHandle: FileSystemFileHandle | null;
      apiClient: GCFormsApiClient;
      decryptionKey: CryptoKey;
      responseName: string;
      selectedFormat: string;
      formId: string;
      formTemplate: FormProperties;
      t: import("i18next").TFunction;
      logger: ResponseDownloadLogger;
    } = {
      setProcessedSubmissionIds,
      setHasMaliciousAttachments,
      workingDirectoryHandle: dir as unknown as FileSystemDirectoryHandle,
      htmlDirectoryHandle: dir as unknown as FileSystemDirectoryHandle,
      csvFileHandle: null,
      apiClient: mockApiClient,
      decryptionKey: {} as CryptoKey,
      responseName: "submission-1",
      selectedFormat: "html",
      formId: "test-form",
      formTemplate: formTemplate as FormProperties,
      t: defaultT,
      logger: logger as ResponseDownloadLogger,
    };

    await processResponse(opts);

    // Grab the written HTML from the in-memory map
    // globalThis.__IN_MEMORY_FILES__ is set by the in-memory writable on close
    // Read it from Node side and then inject into the browser page
    type InMemoryFiles = Record<string, string | undefined> | undefined;
    const globalFiles = (globalThis as unknown as { __IN_MEMORY_FILES__?: InMemoryFiles }).__IN_MEMORY_FILES__;
    const html = globalFiles?.["submission-1.html"];

    if (!html) throw new Error("No captured HTML found in __IN_MEMORY_FILES__");

    // Inject into the browser page by writing to the document directly
    // (the browser test environment exposes `document`)
    if (typeof document === "undefined") {
      throw new Error("Browser document is not available in this test environment");
    }

    document.open();
    document.write("<!doctype html>" + html);
    document.close();

    // Ensure content is present
    await expect.element(page.getByRole("heading", { level: 1 })).toBeInTheDocument();
    const enTable = page.getByTestId("responseTableColEn");
    await expect.element(enTable.getByTestId("col-question-0")).toBeInTheDocument();
    await expect.element(enTable.getByTestId("col-answer-0")).toBeInTheDocument();
  });
});
