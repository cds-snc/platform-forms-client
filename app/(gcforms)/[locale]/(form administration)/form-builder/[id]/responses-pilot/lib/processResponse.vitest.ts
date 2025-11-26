
import { describe, it, expect, beforeEach } from "vitest";
import InMemoryDirectoryHandle from "./__tests__/fsMock";
import { prepareTestEnv, defaultSetProcessedSubmissionIds, defaultT } from "./__tests__/testHelpers";

import type { FileSystemDirectoryHandle, FileSystemFileHandle } from "native-file-system-adapter";
import type { FormProperties } from "@gcforms/types";
import type { GCFormsApiClient } from "./apiClient";

// Prepare test environment (mocks + in-memory env)
const prepared = prepareTestEnv();

describe("processResponse", () => {
  let dir: InMemoryDirectoryHandle;
  beforeEach(() => {
    dir = prepared.dir;
  });

  it("writes a CSV row from a submission", async () => {
    const env = prepared;
    const formTemplate = env.formTemplate as unknown as FormProperties;
    const formId = "cmeaj61dl0001xf01aja6mnpf";
    const responseName = "26-11-2b09f";
    const mockApiClient = env.mockApiClient;
    const logger = env.logger;

    // Initialize CSV headers first (matches app behavior)
    const { initCsv } = await import("./csvWriter");
    const { processResponse } = await import("./processResponse");

    await initCsv({
      formId: "test-form",
      dirHandle: dir as unknown as FileSystemDirectoryHandle,
      formTemplate,
    });

    const csvHandle = (await dir.getFileHandle("test-form.csv", {
      create: true,
    })) as unknown as FileSystemFileHandle;

    const setProcessedSubmissionIds = defaultSetProcessedSubmissionIds;
    const t = defaultT;

    await processResponse({
      setProcessedSubmissionIds,
      workingDirectoryHandle: dir as unknown as FileSystemDirectoryHandle,
      htmlDirectoryHandle: null,
      csvFileHandle: csvHandle,
      apiClient: mockApiClient as GCFormsApiClient,
      decryptionKey: {} as unknown as CryptoKey,
      responseName,
      selectedFormat: "csv",
      formId: formId,
      formTemplate,
      t,
      logger,
    });

    const file = await csvHandle.getFile();
    const text = await file.text();

    // Print CSV content for inspection
    // eslint-disable-next-line no-console
    console.log("Generated CSV:\n", text);

    expect(text.length).toBeGreaterThan(0);
    expect(text).toContain("Submission ID");

    // Ensure known fields from submission are present in CSV (name, phone, email)
    expect(text).toContain("Sarah Elyse");
    expect(text).toContain("111-222-3333");
    expect(text).toContain("name@cds-snc.ca");
  });
});
