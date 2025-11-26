import { describe, it, expect, vi, beforeEach } from "vitest";
import InMemoryDirectoryHandle from "./fsMock";
import { processResponse } from "@responses-pilot/lib/processResponse";

// Mock decryptFormSubmission to return fixture JSON
vi.mock("@responses-pilot/lib/utils", () => ({
  decryptFormSubmission: async () => {
    // Use a minimal decrypted JSON matching expected shape
    const payload = {
      createdAt: new Date().toISOString(),
      answers: JSON.stringify({ 2: { value: "test" } }),
      attachments: [],
      checksum: "ignored",
      confirmationCode: "code",
    };
    return JSON.stringify(payload);
  },
}));

describe("processResponse (unit)", () => {
  let dir: InMemoryDirectoryHandle;
  beforeEach(() => {
    dir = new InMemoryDirectoryHandle();
  });

  it("writes a CSV row using the real csv writer", async () => {
    const mockApiClient: any = {
      getFormSubmission: async () => {
        return "encrypted";
      },
      confirmFormSubmission: async () => {},
      getFormTemplate: async () => ({ layout: [], elements: [] }),
      getFormId: () => "test-form",
    };

    // stub logger
    const logger = { info: () => {}, warn: () => {}, error: () => {} } as any;

    // call processResponse with csv format
    await processResponse({
      setProcessedSubmissionIds: () => {},
      workingDirectoryHandle: dir as any,
      htmlDirectoryHandle: null,
      csvFileHandle: await (await dir.getFileHandle("test-form.csv", { create: true })) as any,
      apiClient: mockApiClient,
      decryptionKey: ({} as unknown) as CryptoKey,
      responseName: "submission-1",
      selectedFormat: "csv",
      formId: "test-form",
      formTemplate: { layout: [], elements: [] } as any,
      t: (() => (key: string) => key) as any,
      logger,
    });

    // Read CSV file content
    const fileHandle = await dir.getFileHandle("test-form.csv");
    const file = await (fileHandle as any).getFile();
    const text = await file.text();

    expect(text.length).toBeGreaterThan(0);
    // Should include BOM or header markers
    expect(text).toContain("Submission ID");
  });
});
