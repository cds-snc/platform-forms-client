import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import type { FormProperties } from "@root/lib/types";
import type { GCFormsApiClient } from "./apiClient";
import {
  defaultT,
  prepareTestEnvFromFixtures,
  type PreparedTestEnv,
} from "./__tests__/testHelpers";
import submissionFixture from "./__tests__/fixtures/response-get-support.json";
import templateFixture from "./__tests__/fixtures/template-get-support-cmeaj61dl0001xf01aja6mnpf.json";
import { RAW_RESPONSE_FOLDER, SOURCE_FOLDER } from "./constants";

describe("processResponse failure diagnostics without attachments", () => {
  let env: PreparedTestEnv;

  beforeEach(() => {
    const submission = { ...submissionFixture, attachments: [] };
    env = prepareTestEnvFromFixtures(submission, templateFixture);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const prepare = async () => {
    const { initCsv } = await import("./csvWriter");
    const { processResponse } = await import("./processResponse");
    const dir = env.dir as unknown as FileSystemDirectoryHandle;
    const formTemplate = env.formTemplate as FormProperties;
    await initCsv({ formId: "test-form", dirHandle: dir, formTemplate });
    const csvFileHandle = await dir.getFileHandle("test-form.csv");
    const increment = vi.fn();
    const log = vi.spyOn(env.logger, "log").mockImplementation(() => {});
    const options = {
      incrementProcessedSubmissionsCount: increment,
      setHasMaliciousAttachments: vi.fn(),
      workingDirectoryHandle: dir,
      htmlDirectoryHandle: null,
      csvFileHandle,
      apiClient: env.mockApiClient as GCFormsApiClient,
      decryptionKey: {} as CryptoKey,
      responseName: "submission-1",
      selectedFormat: "csv",
      formId: "test-form",
      formTemplate,
      t: defaultT,
      logger: env.logger,
    };
    return { processResponse, options, increment, log };
  };

  it("identifies a raw JSON close failure without marking the submission processed", async () => {
    const { processResponse, options, increment, log } = await prepare();
    const source = await options.workingDirectoryHandle.getDirectoryHandle(SOURCE_FOLDER, {
      create: true,
    });
    const raw = await source.getDirectoryHandle(RAW_RESPONSE_FOLDER, { create: true });
    const file = await raw.getFileHandle("submission-1.json", { create: true });
    const writable = await file.createWritable();
    const error = new DOMException("File state changed", "InvalidStateError");
    vi.spyOn(writable, "close").mockRejectedValue(error);
    vi.spyOn(file, "createWritable").mockResolvedValue(writable);

    await expect(processResponse(options)).rejects.toBe(error);

    expect(log).toHaveBeenCalledWith(
      "error",
      "Response download operation failed",
      expect.objectContaining({
        submissionId: "submission-1",
        operation: "close raw response writable",
        path: `${SOURCE_FOLDER}/${RAW_RESPONSE_FOLDER}/submission-1.json`,
        error: expect.objectContaining({ name: "InvalidStateError" }),
      })
    );
    expect(increment).not.toHaveBeenCalled();
  });

  it.each([
    ["createWritable", "create CSV writable"],
    ["getFile", "get CSV snapshot"],
    ["seek", "seek to end of CSV"],
    ["write", "write CSV row"],
    ["close", "close CSV writable"],
  ] as const)(
    "identifies a CSV %s failure and preserves the original cause",
    async (method, operation) => {
      const { processResponse, options, increment, log } = await prepare();
      const error = new DOMException("File state changed", "InvalidStateError");
      if (method === "createWritable" || method === "getFile") {
        vi.spyOn(options.csvFileHandle, method).mockRejectedValue(error);
      } else {
        const writable = await options.csvFileHandle.createWritable({ keepExistingData: true });
        vi.spyOn(writable, method).mockRejectedValue(error);
        vi.spyOn(options.csvFileHandle, "createWritable").mockResolvedValue(writable);
      }

      await expect(processResponse(options)).rejects.toMatchObject({ cause: error });

      expect(log).toHaveBeenCalledWith(
        "error",
        "CSV file operation failed",
        expect.objectContaining({
          submissionId: "submission-1",
          operation,
          path: "test-form.csv",
          error: expect.objectContaining({ name: "InvalidStateError" }),
        })
      );
      expect(increment).not.toHaveBeenCalled();
    }
  );

  it("identifies a raw JSON readback failure", async () => {
    const { processResponse, options, increment, log } = await prepare();
    const source = await options.workingDirectoryHandle.getDirectoryHandle(SOURCE_FOLDER, {
      create: true,
    });
    const raw = await source.getDirectoryHandle(RAW_RESPONSE_FOLDER, { create: true });
    const file = await raw.getFileHandle("submission-1.json", { create: true });
    const error = new DOMException("File state changed", "InvalidStateError");
    vi.spyOn(file, "getFile").mockRejectedValue(error);

    await expect(processResponse(options)).rejects.toMatchObject({ cause: error });

    expect(log).toHaveBeenCalledWith(
      "error",
      "Response download operation failed",
      expect.objectContaining({
        submissionId: "submission-1",
        operation: "get raw response snapshot",
        path: `${SOURCE_FOLDER}/${RAW_RESPONSE_FOLDER}/submission-1.json`,
      })
    );
    expect(increment).not.toHaveBeenCalled();
  });

  it("records successful progress without including response contents", async () => {
    const { processResponse, options, increment, log } = await prepare();

    await processResponse(options);

    expect(increment).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith(
      "info",
      "Submission processing completed",
      expect.objectContaining({
        submissionId: "submission-1",
        format: "csv",
        attachmentCount: 0,
        durationMs: expect.any(Number),
      })
    );
    const journal = JSON.stringify(log.mock.calls);
    expect(journal).not.toContain(submissionFixture.answers);
    expect(journal).not.toContain("confirmationCode");
    expect(log.mock.calls.some(([level]) => level === "error")).toBe(false);
  });
});
