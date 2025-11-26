import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InMemoryDirectoryHandle from "./__tests__/fsMock";
import { processResponse } from "./processResponse";
import { initCsv } from "./csvWriter";

import type { FileSystemDirectoryHandle, FileSystemFileHandle } from "native-file-system-adapter";
import type { FormProperties } from "@gcforms/types";
import type { EncryptedFormSubmission } from "./types";
import type { GCFormsApiClient } from "./apiClient";
import type { ResponseDownloadLogger } from "./logger";
import type { TFunction } from "i18next";

// Fixtures
import submissionFixture from "./__tests__/fixtures/submission-25-11-d70b9.json";
import templateFixture from "./__tests__/fixtures/get-support-2025-11-26.json";

// Mock decryptFormSubmission in local utils module path
vi.mock("./utils", () => ({
  decryptFormSubmission: async () => JSON.stringify(submissionFixture),
}));

// Mock md5 to match checksum in fake payload
vi.mock("hash-wasm", () => ({
  md5: async () => "5d5877990b57e4c2cc096683f90f141f",
}));

describe("processResponse", () => {
  let dir: InMemoryDirectoryHandle;
  beforeEach(() => {
    dir = new InMemoryDirectoryHandle();
  });

  it("writes a CSV row from a submission", async () => {
    const formTemplate = templateFixture as unknown as FormProperties;

    const mockApiClient: Partial<GCFormsApiClient> = {
      getFormSubmission: async (submissionName: string) => {
        return {
          encryptedResponses: "encrypted-data",
          encryptedKey: "key",
          encryptedNonce: "nonce",
          encryptedAuthTag: "tag",
          name: submissionName,
          confirmationCode: submissionFixture.confirmationCode,
        } as unknown as EncryptedFormSubmission;
      },
      confirmFormSubmission: async () => {},
      getFormTemplate: async () => formTemplate,
      getFormId: () => "test-form",
      getNewFormSubmissions: async () => [],
    };

    const logger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    } as unknown as ResponseDownloadLogger;

    // Initialize CSV headers first (matches app behavior)
    await initCsv({
      formId: "test-form",
      dirHandle: dir as unknown as FileSystemDirectoryHandle,
      formTemplate,
    });

    const csvHandle = (await dir.getFileHandle("test-form.csv", {
      create: true,
    })) as unknown as FileSystemFileHandle;

    const setProcessedSubmissionIds: React.Dispatch<React.SetStateAction<Set<string>>> = () => {};
    const t: TFunction = ((k: string) => k) as unknown as TFunction;

    await processResponse({
      setProcessedSubmissionIds,
      workingDirectoryHandle: dir as unknown as FileSystemDirectoryHandle,
      htmlDirectoryHandle: null,
      csvFileHandle: csvHandle,
      apiClient: mockApiClient as GCFormsApiClient,
      decryptionKey: {} as unknown as CryptoKey,
      responseName: "submission-1",
      selectedFormat: "csv",
      formId: "test-form",
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
    expect(text).toContain("test");
    expect(text).toContain("111-222-3333");
    expect(text).toContain("name@example.com");
  });
});
