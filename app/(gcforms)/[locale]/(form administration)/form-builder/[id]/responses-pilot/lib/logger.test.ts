import { describe, expect, it, vi } from "vitest";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { logDownloadOperation, ResponseDownloadLogger } from "./logger";
import InMemoryDirectoryHandle from "./__tests__/fsMock";

describe("response download diagnostics", () => {
  it("persists operation context and nested DOMException causes in the journal", async () => {
    const directory = new InMemoryDirectoryHandle();
    const logger = new ResponseDownloadLogger();
    logger.setDirectoryHandle(directory as unknown as FileSystemDirectoryHandle);
    const cause = new DOMException("File state changed", "InvalidStateError");
    logger.error("CSV file operation failed", new Error("Write failed", { cause }), {
      submissionId: "submission-1",
      operation: "close CSV writable",
      path: "test-form.csv",
    });

    await logger.flush();

    const fileHandle = [...directory.files.values()][0];
    const journal = await (await fileHandle.getFile()).text();
    expect(journal).toContain("[ERROR] CSV file operation failed");
    expect(journal).toContain('"operation": "close CSV writable"');
    expect(journal).toContain('"path": "test-form.csv"');
    expect(journal).toContain('"submissionId": "submission-1"');
    expect(journal).toContain('"name": "InvalidStateError"');
    expect(journal).toContain('"message": "File state changed"');
  });

  it("preserves nested filesystem errors in JSON journal data", () => {
    const logger = new ResponseDownloadLogger();
    const log = vi.spyOn(logger, "log").mockImplementation(() => {});
    const cause = new DOMException("File state changed", "InvalidStateError");
    const error = new Error("CSV write failed", { cause });

    logger.error("Processing failed", error, { submissionId: "submission-1" });

    const data = JSON.parse(JSON.stringify(log.mock.calls[0][2]));
    expect(data).toMatchObject({
      submissionId: "submission-1",
      error: {
        message: "CSV write failed",
        name: "Error",
        cause: { message: "File state changed", name: "InvalidStateError" },
      },
    });
  });

  it("bounds recursive error causes", () => {
    const logger = new ResponseDownloadLogger();
    const log = vi.spyOn(logger, "log").mockImplementation(() => {});
    const error = new Error("Circular cause");
    error.cause = error;

    logger.error("Processing failed", error);

    expect(() => JSON.stringify(log.mock.calls[0][2])).not.toThrow();
  });

  it("logs the failing operation and relative path, then rethrows the original exception", async () => {
    const logger = new ResponseDownloadLogger();
    const log = vi.spyOn(logger, "log").mockImplementation(() => {});
    const error = new DOMException("File state changed", "InvalidStateError");
    const context = {
      submissionId: "submission-1",
      operation: "close raw response writable",
      path: "source/raw_data-donnees_brutes/submission-1.json",
    };

    await expect(
      logDownloadOperation(logger, context, async () => {
        throw error;
      })
    ).rejects.toBe(error);

    const data = JSON.parse(JSON.stringify(log.mock.calls[0][2]));
    expect(log).toHaveBeenCalledOnce();
    expect(data).toMatchObject({
      ...context,
      durationMs: expect.any(Number),
      error: { name: "InvalidStateError", message: "File state changed" },
    });
    expect(data.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("returns successful results without adding a journal entry", async () => {
    const logger = new ResponseDownloadLogger();
    const log = vi.spyOn(logger, "log").mockImplementation(() => {});
    const file = { name: "submission-1.json" };

    await expect(
      logDownloadOperation(
        logger,
        { submissionId: "submission-1", operation: "open raw response file" },
        async () => file
      )
    ).resolves.toBe(file);
    expect(log).not.toHaveBeenCalled();
  });
});
