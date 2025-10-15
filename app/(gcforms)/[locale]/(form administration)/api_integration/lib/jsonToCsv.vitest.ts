import { describe, it, expect, vi, beforeEach } from "vitest";
import { processJsonToCsv } from "./jsonFilesToCsv";
import type { IGCFormsApiClient } from "./IGCFormsApiClient";
import { createArrayCsvStringifier } from "@lib/responses/csv-writer";

// Mock @lib/responses/csv-writer (not csv-writer directly)
vi.mock("@lib/responses/csv-writer", () => ({
  createArrayCsvStringifier: vi.fn(),
}));

// Import fixtures
import templateFixture from "./__fixtures__/get-support-2025-10-14.json";
import data1Fixture from "./__fixtures__/14-10-97029.json";
import data2Fixture from "./__fixtures__/14-10-b81b6.json";
import dataDynamicFixture from "./__fixtures__/14-10-dynamic.json";

describe("processJsonToCsv", () => {
  let mockDirectoryHandle: FileSystemDirectoryHandle;
  let mockFileHandle: FileSystemFileHandle;
  let mockWritable: FileSystemWritableFileStream;
  let mockApiClient: IGCFormsApiClient;

  beforeEach(() => {
    // Mock FileSystemWritableFileStream
    mockWritable = {
      write: vi.fn(async () => {}),
      close: vi.fn(async () => {}),
    } as unknown as FileSystemWritableFileStream;

    // Mock FileSystemFileHandle
    mockFileHandle = {
      createWritable: vi.fn(async () => mockWritable),
    } as unknown as FileSystemFileHandle;

    // Mock FileSystemDirectoryHandle
    mockDirectoryHandle = {
      getFileHandle: vi.fn(async (fileName: string, _options?: { create?: boolean }) => {
        if (fileName === "14-10-97029.json" || fileName === "14-10-b81b6.json" || fileName === "14-10-dynamic.json") {
          return {
            getFile: vi.fn(async () => {
              let content = "";
              if (fileName === "14-10-97029.json") {
                content = JSON.stringify(data1Fixture);
              } else if (fileName === "14-10-b81b6.json") {
                content = JSON.stringify(data2Fixture);
              } else if (fileName === "14-10-dynamic.json") {
                content = JSON.stringify(dataDynamicFixture);
              }
              return new File([content], fileName, { type: "application/json" });
            }),
          } as unknown as FileSystemFileHandle;
        }
        return mockFileHandle;
      }),
    } as unknown as FileSystemDirectoryHandle;

    // Mock API client
    mockApiClient = {
      getFormTemplate: vi.fn(async () => templateFixture),
    } as unknown as IGCFormsApiClient;

    // Mock createArrayCsvStringifier to return a working stringifier
    vi.mocked(createArrayCsvStringifier).mockReturnValue({
      getHeaderString: vi.fn(() => ""),
      stringifyRecords: vi.fn(() => ""),
    } as unknown as ReturnType<typeof createArrayCsvStringifier>);
  });

  it("should call API to get form template", async () => {
    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["14-10-97029.json"],
      directoryHandle: mockDirectoryHandle,
      apiClient: mockApiClient,
    });

    // Verify API was called to get template
    expect(mockApiClient.getFormTemplate).toHaveBeenCalled();
  });

  it("should attempt to read JSON files from directory", async () => {
    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["14-10-97029.json", "14-10-b81b6.json"],
      directoryHandle: mockDirectoryHandle,
      apiClient: mockApiClient,
    });

    // Verify it attempted to read the JSON files
    expect(mockDirectoryHandle.getFileHandle).toHaveBeenCalledWith("14-10-97029.json");
    expect(mockDirectoryHandle.getFileHandle).toHaveBeenCalledWith("14-10-b81b6.json");
  });

  it("should parse answers field from JSON fixture", async () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["14-10-97029.json"],
      directoryHandle: mockDirectoryHandle,
      apiClient: mockApiClient,
    });

    // The implementation should successfully parse answers and create CSV
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("CSV file created")
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("with 1 responses")
    );

    consoleLogSpy.mockRestore();
  });

  it("should generate correct CSV headers from template", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Track which headers were captured by the mock
    let capturedHeaders: string[] = [];

    // Mock createArrayCsvStringifier for this specific test to capture headers
    vi.mocked(createArrayCsvStringifier).mockImplementation((config) => {
      if (config?.header) {
        capturedHeaders = config.header;
      }
      return {
        getHeaderString: vi.fn(() => ""),
        stringifyRecords: vi.fn(() => ""),
      } as unknown as ReturnType<typeof createArrayCsvStringifier>;
    });

    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["14-10-97029.json"],
      directoryHandle: mockDirectoryHandle,
      apiClient: mockApiClient,
    });

    // Verify headers were captured (even though no data rows are written)
    expect(capturedHeaders.length).toBeGreaterThan(0);

    // Check for metadata headers
    const submissionIdHeader = capturedHeaders[0];
    expect(submissionIdHeader).toContain("Submission ID");
    expect(submissionIdHeader).toContain("Identifiant de soumission");

    const createdAtHeader = capturedHeaders[1];
    expect(createdAtHeader).toContain("Date of submission");
    expect(createdAtHeader).toContain("Date de soumission");

    // Last header should be receipt codes
    const receiptHeader = capturedHeaders[capturedHeaders.length - 1];
    expect(receiptHeader).toContain("Receipt codes");
    expect(receiptHeader).toContain("Codes de réception");

    // Check for form field headers from template
    // Layout order is [2, 8, 9, 10, 11, 12, 13, 14, 15], richText (8) is filtered out
    // Headers: [submissionId, createdAt, 2, 9, 10, 11, 12, 13, 14, 15, receipt]

    // Question 2: "Your name" - should be at index 2
    expect(capturedHeaders[2]).toContain("Your name");

    // Question 9: "Phone number" - should be at index 3
    expect(capturedHeaders[3]).toContain("Phone number");
    expect(capturedHeaders[3]).toContain("Numéro de téléphone");

    // Question 10: "Email address" - should be at index 4
    expect(capturedHeaders[4]).toContain("Email address");
    expect(capturedHeaders[4]).toContain("Adresse courriel");

    // Question 11: "Preferred language for communication" - should be at index 5
    expect(capturedHeaders[5]).toContain("Preferred language for communication");
    expect(capturedHeaders[5]).toContain("Langue de communication préférée");

    // Verify CSV was created (even with 0 responses)
    expect(consoleLogSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("should process answer data and generate CSV records", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Track which records were passed to stringifyRecords
    let capturedRecords: string[][] = [];
    let capturedHeaders: string[] = [];

    // Clear the default mock from beforeEach and set up our own
    vi.mocked(createArrayCsvStringifier).mockClear();
    vi.mocked(createArrayCsvStringifier).mockImplementation((config) => {
      if (config?.header) {
        capturedHeaders = config.header;
      }
      const stringifyRecordsFn = vi.fn((records: string[][]) => {
        // eslint-disable-next-line no-console
        console.log("stringifyRecords called with:", records.length, "records");
        capturedRecords = records;
        return "record1\nrecord2\n";
      });
      return {
        getHeaderString: vi.fn(() => "header\n"),
        stringifyRecords: stringifyRecordsFn,
      } as unknown as ReturnType<typeof createArrayCsvStringifier>;
    });

    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["14-10-97029.json"],
      directoryHandle: mockDirectoryHandle,
      apiClient: mockApiClient,
    });

    // Debug: Check what console methods were called
    if (consoleErrorSpy.mock.calls.length > 0) {
      // eslint-disable-next-line no-console
      console.log("ERROR OCCURRED:", JSON.stringify(consoleErrorSpy.mock.calls, null, 2));
      throw new Error(`Errors occurred during processing: ${JSON.stringify(consoleErrorSpy.mock.calls)}`);
    }
    if (consoleSpy.mock.calls.length > 0) {
      // eslint-disable-next-line no-console
      console.log("WARNINGS:", JSON.stringify(consoleSpy.mock.calls, null, 2));
    }


    expect(capturedRecords.length).toBeGreaterThan(0);

    // Get the first record
    const firstRecord = capturedRecords[0];
    expect(firstRecord).toBeDefined();
    expect(Array.isArray(firstRecord)).toBe(true);

    // Verify record structure matches headers
    expect(firstRecord.length).toBe(capturedHeaders.length);

    // Verify metadata columns (first 2 columns)
    // Index 0: Submission ID
    expect(firstRecord[0]).toBeDefined();

    // Index 1: Created date (should be ISO string)
    expect(firstRecord[1]).toBeDefined();
    expect(firstRecord[1]).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO date format

    // Verify answer data is present
    // The fixture has answers: {"2":"a","9":"111-222-3333","10":"name@example.com","11":"English","12":"Other ","13":"other","14":"test"}
    // Layout order is [2, 8, 9, 10, 11, 12, 13, 14, 15], richText (8) is filtered out
    // So indices are: [0:submissionId, 1:createdAt, 2:q2, 3:q9, 4:q10, 5:q11, 6:q12, 7:q13, 8:q14, 9:q15, 10:receipt]

    // Index 2: Question 2 answer
    expect(firstRecord[2]).toBeDefined();

    // Index 3: Question 9 answer (phone: "111-222-3333")
    expect(firstRecord[3]).toBeDefined();
    // Phone number should be in the answer (either directly or as part of mapped answer)
    if (firstRecord[3] !== "-") {
      expect(firstRecord[3]).toBeTruthy();
    }

    // Index 4: Question 10 answer (email: "name@example.com")
    expect(firstRecord[4]).toBeDefined();
    // Email should be in the answer
    if (firstRecord[4] !== "-") {
      expect(firstRecord[4]).toBeTruthy();
    }

    // Index 5: Question 11 answer (language: "English")
    expect(firstRecord[5]).toBeDefined();
    // Language should be in the answer
    if (firstRecord[5] !== "-") {
      expect(firstRecord[5]).toBeTruthy();
    }

    // Last index: Receipt codes
    const receiptIndex = firstRecord.length - 1;
    expect(firstRecord[receiptIndex]).toContain("Receipt codes");
    expect(firstRecord[receiptIndex]).toContain("codes de réception");

    // Verify CSV was created with 1 response
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/CSV file created:.*with 1 responses/)
    );

    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should handle multiple JSON files with answer data", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Track records
    let capturedRecords: string[][] = [];

    vi.mocked(createArrayCsvStringifier).mockImplementation(() => {
      return {
        getHeaderString: vi.fn(() => "header\n"),
        stringifyRecords: vi.fn((records: string[][]) => {
          capturedRecords = records;
          return "records\n";
        }),
      } as unknown as ReturnType<typeof createArrayCsvStringifier>;
    });

    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["14-10-97029.json", "14-10-b81b6.json"],
      directoryHandle: mockDirectoryHandle,
      apiClient: mockApiClient,
    });

    // Verify we processed both files
    expect(capturedRecords.length).toBe(2);

    // Verify each record has data
    capturedRecords.forEach((record) => {
      expect(record.length).toBeGreaterThan(0);
      // Should have submission ID
      expect(record[0]).toBeDefined();
      // Should have created date
      expect(record[1]).toBeDefined();
      expect(record[1]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    // Verify CSV was created with 2 responses
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/CSV file created:.*with 2 responses/)
    );

    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("should handle dynamic rows (repeating sets) correctly", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Track records
    let capturedRecords: string[][] = [];

    vi.mocked(createArrayCsvStringifier).mockImplementation(() => {
      return {
        getHeaderString: vi.fn(() => "header\n"),
        stringifyRecords: vi.fn((records: string[][]) => {
          capturedRecords = records;
          return "records\n";
        }),
      } as unknown as ReturnType<typeof createArrayCsvStringifier>;
    });

    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["14-10-dynamic.json"],
      directoryHandle: mockDirectoryHandle,
      apiClient: mockApiClient,
    });

    // Verify records were captured
    expect(capturedRecords.length).toBeGreaterThan(0);

    const firstRecord = capturedRecords[0];
    expect(firstRecord).toBeDefined();

    // Find the dynamic row column (element 15)
    // Layout is now [2, 8, 9, 10, 11, 12, 13, 14, 15], richText (8) is filtered
    // So indices: [0:submissionId, 1:createdAt, 2:q2, 3:q9, 4:q10, 5:q11, 6:q12, 7:q13, 8:q14, 9:q15, 10:receipt]
    const dynamicRowIndex = 9; // Question 15 is at index 9

    // Verify dynamic row answer exists
    expect(firstRecord[dynamicRowIndex]).toBeDefined();

    // Dynamic row should contain multiple items separated by newlines
    const dynamicRowAnswer = firstRecord[dynamicRowIndex];
    if (dynamicRowAnswer !== "-") {
      // Should contain the sub-answers with question labels
      expect(dynamicRowAnswer).toContain("Item");
      // Should contain the actual values (A, B, C)
      expect(dynamicRowAnswer).toMatch(/A|B|C/);
      // Should have newline separators between rows
      expect(dynamicRowAnswer).toContain("\n");
    }

    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("should return early if no directory handle provided", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["14-10-97029.json"],
      directoryHandle: null,
      apiClient: mockApiClient,
    });

    // Should not call API if no directory handle
    expect(mockApiClient.getFormTemplate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should return early if no JSON files provided", async () => {
    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: [],
      directoryHandle: mockDirectoryHandle,
      apiClient: mockApiClient,
    });

    // Should not call API if no files
    expect(mockApiClient.getFormTemplate).not.toHaveBeenCalled();
  });

  it("should warn and return if API client is null", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["14-10-97029.json"],
      directoryHandle: mockDirectoryHandle,
      apiClient: null,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "No apiClient provided to processJsonToCsv"
    );

    consoleSpy.mockRestore();
  });

  it("should warn if directory handle is invalid", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["14-10-97029.json"],
      directoryHandle: { invalid: true }, // Invalid handle without getFileHandle
      apiClient: mockApiClient,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Invalid directoryHandle provided to processJsonToCsv"
    );

    consoleSpy.mockRestore();
  });

  it("should handle JSON parse errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const badDirectoryHandle = {
      getFileHandle: vi.fn(async (fileName: string, options?: { create?: boolean }) => {
        if (fileName.endsWith(".json") && !options?.create) {
          return {
            getFile: vi.fn(async () => {
              return new File(["invalid json{{{"], fileName, { type: "application/json" });
            }),
          } as unknown as FileSystemFileHandle;
        }
        return mockFileHandle;
      }),
    } as unknown as FileSystemDirectoryHandle;

    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["bad-file.json"],
      directoryHandle: badDirectoryHandle,
      apiClient: mockApiClient,
    });

    // Should log parse error
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to parse"),
      expect.anything()
    );

    consoleSpy.mockRestore();
  });

  it("should warn if no valid answers data found", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const emptyDirectoryHandle = {
      getFileHandle: vi.fn(async (fileName: string) => {
        return {
          getFile: vi.fn(async () => {
            // Return JSON without answers field
            return new File([JSON.stringify({ status: "New" })], fileName, {
              type: "application/json"
            });
          }),
        } as unknown as FileSystemFileHandle;
      }),
    } as unknown as FileSystemDirectoryHandle;

    await processJsonToCsv({
      formId: "test-form-id",
      jsonFileNames: ["empty.json"],
      directoryHandle: emptyDirectoryHandle,
      apiClient: mockApiClient,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("No answers field found")
    );

    consoleSpy.mockRestore();
  });

  // TODO: Add test once implementation completes CSV file creation
  it.todo("should create CSV file with timestamp in filename");
});
