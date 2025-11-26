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
import submissionFixture from "./__tests__/fixtures/response-get-support.json";
import templateFixture from "./__tests__/fixtures/template-get-support-cmeaj61dl0001xf01aja6mnpf.json";
import crypto from "crypto";

// Mock decryptFormSubmission in local utils module path
vi.mock("./utils", () => ({
  decryptFormSubmission: async () => JSON.stringify(submissionFixture),
}));

// Compute checksum from fixture and mock md5 to return it
const expectedChecksum = crypto.createHash("md5").update(submissionFixture.answers).digest("hex");
vi.mock("hash-wasm", () => ({
  md5: async () => expectedChecksum,
}));

describe("processResponse", () => {
  let dir: InMemoryDirectoryHandle;
  beforeEach(() => {
    dir = new InMemoryDirectoryHandle();
  });

  it("writes a CSV row from a submission", async () => {
    const formTemplate = templateFixture as unknown as FormProperties;
    const formId = "cmeaj61dl0001xf01aja6mnpf";
    const responseName = "26-11-2b09f";

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
      getFormId: () => formId,
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
