import { describe, it, expect, beforeEach } from "vitest";
import InMemoryDirectoryHandle from "./__tests__/fsMock";
import { prepareTestEnvFromFixtures, defaultSetProcessedSubmissionIds, defaultT, testLogger } from "./__tests__/testHelpers";

import type { FileSystemDirectoryHandle, FileSystemFileHandle } from "native-file-system-adapter";
import type { FormProperties } from "@gcforms/types";
import type { GCFormsApiClient } from "./apiClient";

import responseFixture from "./__tests__/fixtures/response-repeating-26-11-28610.json";
import templateFixture from "./__tests__/fixtures/template-equipment-list-2025-11-26.json";

// Prepare test environment (mocks + in-memory env) using provided fixtures
const prepared = prepareTestEnvFromFixtures(responseFixture, templateFixture);

describe("processResponse - repeating set", () => {
  let dir: InMemoryDirectoryHandle;
  beforeEach(() => {
    dir = prepared.dir;
  });

  it("writes repeating set rows into CSV correctly", async () => {
    const env = prepared;
    const formTemplate = env.formTemplate as unknown as FormProperties;
    const formId = "test-form";
    const responseName = "26-11-28610";
    const mockApiClient = env.mockApiClient;
    const logger = env.logger ?? testLogger;

    // Initialize CSV headers first (matches app behavior)
    const { initCsv } = await import("./csvWriter");
    const { processResponse } = await import("./processResponse");

    await initCsv({
      formId:
        "test-form",
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

    // CSV content generated (previously logged for debugging)

    expect(text.length).toBeGreaterThan(0);
    expect(text).toContain("Submission ID");

    // Ensure known repeating values are present
    expect(text).toContain("List the names of the equipment you need");
    expect(text).toContain("Name\n: Item 1");
    expect(text).toContain("Name\n: Item 2");
    expect(text).toContain("Name\n: Item 3");
  });
});
