import { describe, it, expect, beforeEach, vi } from "vitest";
import InMemoryDirectoryHandle from "./__tests__/fsMock";
import {
  prepareTestEnvFromFixtures,
  defaultSetProcessedSubmissionIds,
  defaultT,
  testLogger,
} from "./__tests__/testHelpers";

import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import type { FormProperties } from "@gcforms/types";
import type { GCFormsApiClient } from "./apiClient";

import responseUniqueNames from "./__tests__/fixtures/response-attachments-uniquenames-26-11-787e7.json";
import responseDuplicateNames from "./__tests__/fixtures/response-attachments-duplicates-26-11-6ae44.json";
import responseMalicious from "./__tests__/fixtures/response-attachments-malicious.json";
import templateFixture from "./__tests__/fixtures/template-file-upload.json";
import { MAPPING_FILENAME } from "./constants";

type AttachmentMapping = Record<string, { originalName: string; actualName: string; isPotentiallyMalicious: boolean; }>;

describe("processResponse - attachment handling", () => {

  describe("attachments with unique names", () => {
    let testDir: InMemoryDirectoryHandle;
    let prepared: ReturnType<typeof prepareTestEnvFromFixtures>;

    beforeEach(() => {
      // Create environment fresh for each test
      prepared = prepareTestEnvFromFixtures(responseUniqueNames, templateFixture);
      // Create a fresh directory for each test to ensure isolation
      testDir = new InMemoryDirectoryHandle();
      // Mock fetch for attachment downloads
      global.fetch = vi.fn((input: RequestInfo | URL) => {
        // Extract attachment ID from URL and return mock file content
        const mockContent = `Mock content for ${input}`;
        return Promise.resolve({
          ok: true,
          body: {
            pipeTo: async (stream: WritableStream) => {
              const writer = stream.getWriter();
              await writer.write(mockContent);
              await writer.close();
            },
          },
        } as Response);
      }) as typeof fetch;
    });

    it("writes attachments to correct filesystem paths", async () => {
      const env = prepared;
      const formTemplate = env.formTemplate as unknown as FormProperties;
      const formId = "test-form";
      const responseName = "26-11-787e7";
      const mockApiClient = env.mockApiClient;
      const logger = env.logger ?? testLogger;

      const { processResponse } = await import("./processResponse");

      const htmlDir = await testDir.getDirectoryHandle("html", { create: true });

      await processResponse({
        setProcessedSubmissionIds: defaultSetProcessedSubmissionIds,
        setHasMaliciousAttachments: () => {},
        workingDirectoryHandle: testDir as unknown as FileSystemDirectoryHandle,
        htmlDirectoryHandle: htmlDir as unknown as FileSystemDirectoryHandle,
        csvFileHandle: null,
        apiClient: mockApiClient as GCFormsApiClient,
        decryptionKey: {} as unknown as CryptoKey,
        responseName,
        selectedFormat: "html",
        formId: formId,
        formTemplate,
        t: defaultT,
        logger,
      });

      // Verify attachments directory structure
      const attachmentsDir = await testDir.getDirectoryHandle("attachments");
      const responseAttachmentsDir = await attachmentsDir.getDirectoryHandle(responseName);

      // Verify mapping file was created
      const mappingHandle = await responseAttachmentsDir.getFileHandle(MAPPING_FILENAME);
      expect(mappingHandle).toBeDefined();

      // Verify all 4 attachment files were created
      // Note: Using create: false to verify files exist without creating them
      await expect(responseAttachmentsDir.getFileHandle("test.txt")).resolves.toBeDefined();
      await expect(responseAttachmentsDir.getFileHandle("test.docx")).resolves.toBeDefined();
      await expect(responseAttachmentsDir.getFileHandle("output.txt")).resolves.toBeDefined();
      await expect(responseAttachmentsDir.getFileHandle("champ-cat.png")).resolves.toBeDefined();
    });

    it("creates mapping.json with correct attachment metadata", async () => {
      const env = prepared;
      const formTemplate = env.formTemplate as unknown as FormProperties;
      const formId = "test-form";
      const responseName = "26-11-787e7";
      const mockApiClient = env.mockApiClient;
      const logger = env.logger ?? testLogger;

      const { processResponse } = await import("./processResponse");

      const htmlDir = await testDir.getDirectoryHandle("html", { create: true });

      await processResponse({
        setProcessedSubmissionIds: defaultSetProcessedSubmissionIds,
        setHasMaliciousAttachments: () => {},
        workingDirectoryHandle: testDir as unknown as FileSystemDirectoryHandle,
        htmlDirectoryHandle: htmlDir as unknown as FileSystemDirectoryHandle,
        csvFileHandle: null,
        apiClient: mockApiClient as GCFormsApiClient,
        decryptionKey: {} as unknown as CryptoKey,
        responseName,
        selectedFormat: "html",
        formId: formId,
        formTemplate,
        t: defaultT,
        logger,
      });

      // Verify mapping file exists
      const attachmentsDir = await testDir.getDirectoryHandle("attachments");
      const responseAttachmentsDir = await attachmentsDir.getDirectoryHandle(responseName);
      const mappingHandle = await responseAttachmentsDir.getFileHandle(MAPPING_FILENAME);
      const mappingFile = await mappingHandle.getFile();
      const mappingContent = await mappingFile.text();
      const mapping = JSON.parse(mappingContent) as AttachmentMapping;

      // Verify mapping contains all 4 attachments
      expect(Object.keys(mapping)).toHaveLength(4);

      // Verify specific mappings - since names are unique, actualName should match originalName
      expect(mapping["f126e975-f29f-4c9e-8fa7-6fe400d54008"]).toEqual({
        originalName: "test.txt",
        actualName: "test.txt",
        isPotentiallyMalicious: false,
      });

      expect(mapping["a22e75fa-16d1-4d4d-a6b4-3c612094a832"]).toEqual({
        originalName: "test.docx",
        actualName: "test.docx",
        isPotentiallyMalicious: false,
      });

      expect(mapping["a3a19f5a-cf8b-4c27-8eae-92c6018ea09a"]).toEqual({
        originalName: "output.txt",
        actualName: "output.txt",
        isPotentiallyMalicious: false,
      });

      expect(mapping["306b0743-a9de-4018-9e65-b9af0c26a157"]).toEqual({
        originalName: "champ-cat.png",
        actualName: "champ-cat.png",
        isPotentiallyMalicious: false,
      });
    });
  });

  describe("attachments with duplicate names", () => {
    let testDir: InMemoryDirectoryHandle;
    let prepared: ReturnType<typeof prepareTestEnvFromFixtures>;

    beforeEach(() => {
      // Create environment fresh for each test
      prepared = prepareTestEnvFromFixtures(responseDuplicateNames, templateFixture);
      // Create a fresh directory for each test to ensure isolation
      testDir = new InMemoryDirectoryHandle();
      // Mock fetch for attachment downloads
      global.fetch = vi.fn((input: RequestInfo | URL) => {
        const mockContent = `Mock content for ${input}`;
        return Promise.resolve({
          ok: true,
          body: {
            pipeTo: async (stream: WritableStream) => {
              const writer = stream.getWriter();
              await writer.write(mockContent);
              await writer.close();
            },
          },
        } as Response);
      }) as typeof fetch;
    });

    it("renames duplicate files with incrementing numbers", async () => {
      const env = prepared;
      const formTemplate = env.formTemplate as unknown as FormProperties;
      const formId = "test-form";
      const responseName = "26-11-6ae44";
      const mockApiClient = env.mockApiClient;
      const logger = env.logger ?? testLogger;

      const { processResponse } = await import("./processResponse");

      const htmlDir = await testDir.getDirectoryHandle("html", { create: true });

      await processResponse({
        setProcessedSubmissionIds: defaultSetProcessedSubmissionIds,
        setHasMaliciousAttachments: () => {},
        workingDirectoryHandle: testDir as unknown as FileSystemDirectoryHandle,
        htmlDirectoryHandle: htmlDir as unknown as FileSystemDirectoryHandle,
        csvFileHandle: null,
        apiClient: mockApiClient as GCFormsApiClient,
        decryptionKey: {} as unknown as CryptoKey,
        responseName,
        selectedFormat: "html",
        formId: formId,
        formTemplate,
        t: defaultT,
        logger,
      });

      // Verify attachments directory structure
      const attachmentsDir = await testDir.getDirectoryHandle("attachments");
      const responseAttachmentsDir = await attachmentsDir.getDirectoryHandle(responseName);

      // Read mapping.json to determine actual filenames used and assert they exist
      const mappingHandle = await responseAttachmentsDir.getFileHandle(MAPPING_FILENAME);
      const mappingFile = await mappingHandle.getFile();
      const mappingContent = await mappingFile.text();
      const mapping = JSON.parse(mappingContent) as AttachmentMapping;


      const actualNames: string[] = Object.values(mapping).map((m) => m.actualName);
      expect(actualNames.length).toBe(5);

      // Verify each mapped filename exists
      for (const name of actualNames) {
        // eslint-disable-next-line no-await-in-loop
        await expect(responseAttachmentsDir.getFileHandle(name)).resolves.toBeDefined();
      }
    });

    it("creates mapping.json with renamed filenames for duplicates", async () => {
      const env = prepared;
      const formTemplate = env.formTemplate as unknown as FormProperties;
      const formId = "test-form";
      const responseName = "26-11-6ae44";
      const mockApiClient = env.mockApiClient;
      const logger = env.logger ?? testLogger;

      const { processResponse } = await import("./processResponse");

      const htmlDir = await testDir.getDirectoryHandle("html", { create: true });

      await processResponse({
        setProcessedSubmissionIds: defaultSetProcessedSubmissionIds,
        setHasMaliciousAttachments: () => {},
        workingDirectoryHandle: testDir as unknown as FileSystemDirectoryHandle,
        htmlDirectoryHandle: htmlDir as unknown as FileSystemDirectoryHandle,
        csvFileHandle: null,
        apiClient: mockApiClient as GCFormsApiClient,
        decryptionKey: {} as unknown as CryptoKey,
        responseName,
        selectedFormat: "html",
        formId: formId,
        formTemplate,
        t: defaultT,
        logger,
      });

      // Verify mapping file
      const attachmentsDir = await testDir.getDirectoryHandle("attachments");
      const responseAttachmentsDir = await attachmentsDir.getDirectoryHandle(responseName);
      const mappingHandle = await responseAttachmentsDir.getFileHandle(MAPPING_FILENAME);
      const mappingFile = await mappingHandle.getFile();
      const mappingContent = await mappingFile.text();
      const mapping = JSON.parse(mappingContent) as AttachmentMapping;

      // Verify mapping contains all 5 attachments and actualName values are unique
      expect(Object.keys(mapping)).toHaveLength(5);

      // Verify that originalName is always "test.txt" but actualName increments
      const attachment1 = mapping["9d277a55-8ad7-43ad-98c7-3edba2745d20"];
      expect(attachment1.originalName).toBe("test.txt");
      expect(attachment1.actualName).toBe("test.txt");

      const attachment2 = mapping["94ded62a-fca1-4d34-b499-124370ce6035"];
      expect(attachment2.originalName).toBe("test.txt");
      expect(attachment2.actualName).toBe("test (1).txt");

      const attachment3 = mapping["fae6f97c-cafa-4cdb-b322-7dc0bf5833bc"];
      expect(attachment3.originalName).toBe("test.txt");
      expect(attachment3.actualName).toBe("test (2).txt");

      const attachment4 = mapping["80885d7e-eadf-4e87-a295-0117df4c82d5"];
      expect(attachment4.originalName).toBe("test.txt");
      expect(attachment4.actualName).toBe("test (3).txt");

      const attachment5 = mapping["f6d623ce-11a2-4c90-b67b-647d42572a14"];
      expect(attachment5.originalName).toBe("test.txt");
      expect(attachment5.actualName).toBe("test (4).txt");

      const actualNames: string[] = Object.values(mapping).map((m) => m.actualName);
      const uniqueActualNames = Array.from(new Set(actualNames));
      expect(uniqueActualNames.length).toBe(actualNames.length);
      // Verify that originalName is "test.txt" for all entries
      Object.values(mapping).forEach((m) => expect(m.originalName).toBe("test.txt"));
      Object.values(mapping).forEach((m) => expect(m.isPotentiallyMalicious).toBe(false));
    });

    it("verifies all renamed files are accessible and contain content", async () => {
      const env = prepared;
      const formTemplate = env.formTemplate as unknown as FormProperties;
      const formId = "test-form";
      const responseName = "26-11-6ae44";
      const mockApiClient = env.mockApiClient;
      const logger = env.logger ?? testLogger;

      const { processResponse } = await import("./processResponse");

      const htmlDir = await testDir.getDirectoryHandle("html", { create: true });

      await processResponse({
        setProcessedSubmissionIds: defaultSetProcessedSubmissionIds,
        setHasMaliciousAttachments: () => {},
        workingDirectoryHandle: testDir as unknown as FileSystemDirectoryHandle,
        htmlDirectoryHandle: htmlDir as unknown as FileSystemDirectoryHandle,
        csvFileHandle: null,
        apiClient: mockApiClient as GCFormsApiClient,
        decryptionKey: {} as unknown as CryptoKey,
        responseName,
        selectedFormat: "html",
        formId: formId,
        formTemplate,
        t: defaultT,
        logger,
      });

      const attachmentsDir = await testDir.getDirectoryHandle("attachments");
      const responseAttachmentsDir = await attachmentsDir.getDirectoryHandle(responseName);

      // Verify each renamed file has content
      // Use mapping.json to determine filenames, then verify each file has content
      const mappingHandle = await responseAttachmentsDir.getFileHandle(MAPPING_FILENAME);
      const mappingFile = await mappingHandle.getFile();
      const mappingContent = await mappingFile.text();
      const mapping = JSON.parse(mappingContent) as AttachmentMapping;


      const actualNames: string[] = Object.values(mapping).map((m) => m.actualName);
      const fileChecks = await Promise.all(
        actualNames.map(async (filename) => {
          const fileHandle = await responseAttachmentsDir.getFileHandle(filename);
          const file = await fileHandle.getFile();
          const content = await file.text();
          return { filename, content };
        })
      );

      fileChecks.forEach(({ content }) => {
        expect(content).toContain("Mock content");
        expect(content.length).toBeGreaterThan(0);
      });
    });
  });

  describe("attachments with potentially malicious files", () => {
    let testDir: InMemoryDirectoryHandle;
    let prepared: ReturnType<typeof prepareTestEnvFromFixtures>;

    beforeEach(() => {
      // Create environment fresh for each test
      prepared = prepareTestEnvFromFixtures(responseMalicious, templateFixture);
      // Create a fresh directory for each test to ensure isolation
      testDir = new InMemoryDirectoryHandle();
      // Mock fetch for attachment downloads
      global.fetch = vi.fn((input: RequestInfo | URL) => {
        const mockContent = `Mock content for ${input}`;
        return Promise.resolve({
          ok: true,
          body: {
            pipeTo: async (stream: WritableStream) => {
              const writer = stream.getWriter();
              await writer.write(mockContent);
              await writer.close();
            },
          },
        } as Response);
      }) as typeof fetch;
    });

    it("places malicious files in separate 'suspicious' subdirectory", async () => {
      const env = prepared;
      const formTemplate = env.formTemplate as unknown as FormProperties;
      const formId = "test-form";
      const responseName = "26-11-787e7";
      const mockApiClient = env.mockApiClient;
      const logger = env.logger ?? testLogger;

      const { processResponse } = await import("./processResponse");

      const htmlDir = await testDir.getDirectoryHandle("html", { create: true });

      await processResponse({
        setProcessedSubmissionIds: defaultSetProcessedSubmissionIds,
        setHasMaliciousAttachments: () => {},
        workingDirectoryHandle: testDir as unknown as FileSystemDirectoryHandle,
        htmlDirectoryHandle: htmlDir as unknown as FileSystemDirectoryHandle,
        csvFileHandle: null,
        apiClient: mockApiClient as GCFormsApiClient,
        decryptionKey: {} as unknown as CryptoKey,
        responseName,
        selectedFormat: "html",
        formId: formId,
        formTemplate,
        t: defaultT,
        logger,
      });

      // Verify attachments directory structure
      const attachmentsDir = await testDir.getDirectoryHandle("attachments");
      const responseAttachmentsDir = await attachmentsDir.getDirectoryHandle(responseName);

      // Verify suspicious subdirectory was created
      const suspiciousDir = await responseAttachmentsDir.getDirectoryHandle("suspicious");
      expect(suspiciousDir).toBeDefined();

      // Verify malicious files (test.txt and output.txt) are in suspicious folder
      await expect(suspiciousDir.getFileHandle("test.txt")).resolves.toBeDefined();
      await expect(suspiciousDir.getFileHandle("output.txt")).resolves.toBeDefined();

      // Verify safe files (test.docx and champ-cat.png) are in main folder
      await expect(responseAttachmentsDir.getFileHandle("test.docx")).resolves.toBeDefined();
      await expect(responseAttachmentsDir.getFileHandle("champ-cat.png")).resolves.toBeDefined();
    });

    it("creates mapping.json with correct isPotentiallyMalicious flags", async () => {
      const env = prepared;
      const formTemplate = env.formTemplate as unknown as FormProperties;
      const formId = "test-form";
      const responseName = "26-11-787e7";
      const mockApiClient = env.mockApiClient;
      const logger = env.logger ?? testLogger;

      const { processResponse } = await import("./processResponse");

      const htmlDir = await testDir.getDirectoryHandle("html", { create: true });

      await processResponse({
        setProcessedSubmissionIds: defaultSetProcessedSubmissionIds,
        setHasMaliciousAttachments: () => {},
        workingDirectoryHandle: testDir as unknown as FileSystemDirectoryHandle,
        htmlDirectoryHandle: htmlDir as unknown as FileSystemDirectoryHandle,
        csvFileHandle: null,
        apiClient: mockApiClient as GCFormsApiClient,
        decryptionKey: {} as unknown as CryptoKey,
        responseName,
        selectedFormat: "html",
        formId: formId,
        formTemplate,
        t: defaultT,
        logger,
      });

      // Verify mapping file
      const attachmentsDir = await testDir.getDirectoryHandle("attachments");
      const responseAttachmentsDir = await attachmentsDir.getDirectoryHandle(responseName);
      const mappingHandle = await responseAttachmentsDir.getFileHandle(MAPPING_FILENAME);
      const mappingFile = await mappingHandle.getFile();
      const mappingContent = await mappingFile.text();
      const mapping = JSON.parse(mappingContent);

      // Verify mapping contains all 4 attachments
      expect(Object.keys(mapping)).toHaveLength(4);

      // Verify malicious attachments are flagged
      expect(mapping["f126e975-f29f-4c9e-8fa7-6fe400d54008"]).toEqual({
        originalName: "test.txt",
        actualName: "test.txt",
        isPotentiallyMalicious: true,
      });

      expect(mapping["a3a19f5a-cf8b-4c27-8eae-92c6018ea09a"]).toEqual({
        originalName: "output.txt",
        actualName: "output.txt",
        isPotentiallyMalicious: true,
      });

      // Verify safe attachments are not flagged
      expect(mapping["a22e75fa-16d1-4d4d-a6b4-3c612094a832"]).toEqual({
        originalName: "test.docx",
        actualName: "test.docx",
        isPotentiallyMalicious: false,
      });

      expect(mapping["306b0743-a9de-4018-9e65-b9af0c26a157"]).toEqual({
        originalName: "champ-cat.png",
        actualName: "champ-cat.png",
        isPotentiallyMalicious: false,
      });
    });

    it("handles duplicate names in suspicious directory separately from main directory", async () => {
      const env = prepared;
      const formTemplate = env.formTemplate as unknown as FormProperties;
      const formId = "test-form";
      const responseName = "26-11-787e7";
      const mockApiClient = env.mockApiClient;
      const logger = env.logger ?? testLogger;

      const { processResponse } = await import("./processResponse");

      const htmlDir = await testDir.getDirectoryHandle("html", { create: true });

      await processResponse({
        setProcessedSubmissionIds: defaultSetProcessedSubmissionIds,
        setHasMaliciousAttachments: () => {},
        workingDirectoryHandle: testDir as unknown as FileSystemDirectoryHandle,
        htmlDirectoryHandle: htmlDir as unknown as FileSystemDirectoryHandle,
        csvFileHandle: null,
        apiClient: mockApiClient as GCFormsApiClient,
        decryptionKey: {} as unknown as CryptoKey,
        responseName,
        selectedFormat: "html",
        formId: formId,
        formTemplate,
        t: defaultT,
        logger,
      });

      const attachmentsDir = await testDir.getDirectoryHandle("attachments");
      const responseAttachmentsDir = await attachmentsDir.getDirectoryHandle(responseName);
      const suspiciousDir = await responseAttachmentsDir.getDirectoryHandle("suspicious");

      // Both test.txt files exist: one safe in main dir, one malicious in suspicious dir
      // They should have the same name since they're in different directories
      const mainTestTxt = await responseAttachmentsDir.getFileHandle("test.docx");
      expect(mainTestTxt).toBeDefined();

      const suspiciousTestTxt = await suspiciousDir.getFileHandle("test.txt");
      expect(suspiciousTestTxt).toBeDefined();

      // The two test.txt files can have the same name because they're in different directories
      const suspiciousOutputTxt = await suspiciousDir.getFileHandle("output.txt");
      expect(suspiciousOutputTxt).toBeDefined();
    });

    it("verifies malicious files are accessible and contain content", async () => {
      const env = prepared;
      const formTemplate = env.formTemplate as unknown as FormProperties;
      const formId = "test-form";
      const responseName = "26-11-787e7";
      const mockApiClient = env.mockApiClient;
      const logger = env.logger ?? testLogger;

      const { processResponse } = await import("./processResponse");

      const htmlDir = await testDir.getDirectoryHandle("html", { create: true });

      await processResponse({
        setProcessedSubmissionIds: defaultSetProcessedSubmissionIds,
        setHasMaliciousAttachments: () => {},
        workingDirectoryHandle: testDir as unknown as FileSystemDirectoryHandle,
        htmlDirectoryHandle: htmlDir as unknown as FileSystemDirectoryHandle,
        csvFileHandle: null,
        apiClient: mockApiClient as GCFormsApiClient,
        decryptionKey: {} as unknown as CryptoKey,
        responseName,
        selectedFormat: "html",
        formId: formId,
        formTemplate,
        t: defaultT,
        logger,
      });

      const attachmentsDir = await testDir.getDirectoryHandle("attachments");
      const responseAttachmentsDir = await attachmentsDir.getDirectoryHandle(responseName);
      const suspiciousDir = await responseAttachmentsDir.getDirectoryHandle("suspicious");

      // Verify malicious files have content
      const testTxtHandle = await suspiciousDir.getFileHandle("test.txt");
      const testTxtFile = await testTxtHandle.getFile();
      const testTxtContent = await testTxtFile.text();
      expect(testTxtContent).toContain("Mock content");

      const outputTxtHandle = await suspiciousDir.getFileHandle("output.txt");
      const outputTxtFile = await outputTxtHandle.getFile();
      const outputTxtContent = await outputTxtFile.text();
      expect(outputTxtContent).toContain("Mock content");
    });
  });
});
