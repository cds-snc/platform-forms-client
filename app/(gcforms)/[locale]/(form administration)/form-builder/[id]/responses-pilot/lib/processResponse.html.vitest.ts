import { describe, it, expect, beforeEach } from "vitest";
import { prepareTestEnv } from "./__tests__/testHelpers";
import InMemoryDirectoryHandle from "./__tests__/fsMock";
import type { GCFormsApiClient } from "./apiClient";
import type { FormProperties } from "@root/lib/types";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";

import type { TFunction } from "i18next";
// Prepare test environment (mocks + in-memory env)
const prepared = prepareTestEnv();

describe("processResponse (html)", () => {
  let dir: InMemoryDirectoryHandle;
  let env: typeof prepared;

  beforeEach(() => {
    env = prepared;
    dir = env.dir;
  });

  it("writes an HTML file from a submission", async () => {
    const { formTemplate, mockApiClient } = env as {
      formTemplate: FormProperties;
      mockApiClient: Partial<GCFormsApiClient>;
      expectedChecksum: string;
      dir: InMemoryDirectoryHandle;
    };

    const { processResponse } = await import("./processResponse");

    const htmlDir = (await dir.getDirectoryHandle("html", { create: true }));

    const setProcessedSubmissionIds: React.Dispatch<React.SetStateAction<Set<string>>> =
      (() => {}) as unknown as React.Dispatch<React.SetStateAction<Set<string>>>;
    const t = ((k: string) => k) as unknown as TFunction;

    await processResponse({
      setProcessedSubmissionIds,
      workingDirectoryHandle: dir as unknown as FileSystemDirectoryHandle,
      htmlDirectoryHandle: htmlDir as unknown as FileSystemDirectoryHandle,
      csvFileHandle: null,
      apiClient: mockApiClient as Partial<GCFormsApiClient> as unknown as GCFormsApiClient,
      decryptionKey: {} as CryptoKey,
      responseName: "submission-1",
      selectedFormat: "html",
      formId: "test-form",
      formTemplate: formTemplate as FormProperties,
      t,
      logger: env.logger,
    });

    const htmlHandle = await htmlDir.getFileHandle("submission-1.html");
    const file = await htmlHandle.getFile();
    const text = await file.text();

    // Ensure file written and contains a label from template
    expect(text.length).toBeGreaterThan(0);
    expect(text).toContain("Your name");
  });
});
