import { beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadFormat } from "@lib/responseDownloadFormats/types";
import { RESPONSES_UI_ZIP_SIZE_LIMIT_BYTES } from "@root/constants";
import type { DownloadResponsesOptions } from "./DownloadDialog.types";

const mocks = vi.hoisted(() => ({
  addResponseAttachmentsToZip: vi.fn(),
  ga: vi.fn(),
  generateDownloadZip: vi.fn(),
  getSubmissionsByFormat: vi.fn(),
  getTemplateHasFileInput: vi.fn(),
}));
const OriginalTextEncoder = globalThis.TextEncoder;

vi.mock("@lib/client/clientHelpers", () => ({ ga: mocks.ga }));
vi.mock("@lib/responseDownloadFormats/attachments", () => ({
  addResponseAttachmentsToZip: mocks.addResponseAttachmentsToZip,
}));
vi.mock("../../../actions", () => ({
  getSubmissionsByFormat: mocks.getSubmissionsByFormat,
  getTemplateHasFileInput: mocks.getTemplateHasFileInput,
}));
vi.mock("./downloadZip", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./downloadZip")>();
  return {
    ...actual,
    generateDownloadZip: mocks.generateDownloadZip,
  };
});

import { downloadResponses } from "./downloadResponses";

const createOptions = (
  filteredIds: string[],
  onDownloadComplete: DownloadResponsesOptions["onDownloadComplete"]
) => ({
  formId: "form-id",
  format: DownloadFormat.HTML_ZIPPED,
  language: "en" as const,
  version: null,
  filteredIds,
  filePrefix: "form-",
  shouldCreateZip: true,
  setDownloadProgress: vi.fn(),
  setIsDownloading: vi.fn(),
  onDownloadComplete,
  onClose: vi.fn(),
});

describe("downloadResponses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSubmissionsByFormat.mockImplementation(({ ids, trackDownload }) =>
      trackDownload
        ? Promise.resolve({})
        : Promise.resolve({
            receipt: ids.join(","),
            responses: [{ id: ids[0], html: "response" }],
            attachments: [{ filename: "attachment.png" }],
          })
    );
    mocks.getTemplateHasFileInput.mockResolvedValue(true);
    mocks.addResponseAttachmentsToZip.mockResolvedValue([]);
    mocks.generateDownloadZip.mockResolvedValue(undefined);
  });

  it("tracks only responses whose attachments were included", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    mocks.addResponseAttachmentsToZip
      .mockResolvedValueOnce([
        {
          code: "PROCESSING",
          responseId: "response-1",
          filename: "attachment.png",
          reason: "Download failed",
        },
      ])
      .mockResolvedValueOnce([]);

    await downloadResponses(createOptions(["response-1", "response-2"], onDownloadComplete));

    const trackingCall = mocks.getSubmissionsByFormat.mock.calls.find(
      ([options]) => options.trackDownload
    );
    expect(trackingCall?.[0].ids).toEqual(["response-2"]);
    expect(onDownloadComplete).toHaveBeenCalledWith(["response-2"], {
      sizeLimitReached: false,
      processingFailed: true,
    });
    const zip = mocks.generateDownloadZip.mock.calls[0][0].zip;
    expect(zip.files["response-1.html"]).toBeUndefined();
    expect(zip.files["response-2.html"]).toBeDefined();
    await expect(zip.files["_receipt-recu.html"].async("string")).resolves.toBe("response-2");
  });

  it("includes attachments only alongside their complete responses", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    mocks.addResponseAttachmentsToZip
      .mockImplementationOnce(async (_zip, _attachments, options) => {
        options.addFileToZip("response-1/attachment.txt", "partial attachment");
        return [
          {
            code: "PROCESSING",
            responseId: "response-1",
            filename: "missing.txt",
            reason: "HTTP 404",
          },
        ];
      })
      .mockImplementationOnce(async (_zip, _attachments, options) => {
        options.addFileToZip("response-2/attachment.txt", "complete attachment");
        return [];
      });

    await downloadResponses(createOptions(["response-1", "response-2"], onDownloadComplete));

    const zip = mocks.generateDownloadZip.mock.calls[0][0].zip;
    expect(zip.files["response-1.html"]).toBeUndefined();
    expect(zip.files["response-1/attachment.txt"]).toBeUndefined();
    expect(zip.files["response-2.html"]).toBeDefined();
    await expect(zip.files["response-2/attachment.txt"].async("string")).resolves.toBe(
      "complete attachment"
    );
    expect(onDownloadComplete).toHaveBeenCalledWith(["response-2"], {
      sizeLimitReached: false,
      processingFailed: true,
    });
  });

  it("exports collected responses when receipt regeneration fails without tracking them", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    mocks.addResponseAttachmentsToZip
      .mockResolvedValueOnce([
        {
          code: "PROCESSING",
          responseId: "response-1",
          filename: "attachment.png",
          reason: "Download failed",
        },
      ])
      .mockResolvedValueOnce([]);
    mocks.getSubmissionsByFormat.mockImplementation(
      ({ ids, trackDownload, includeResponses, includeAttachments }) => {
        if (trackDownload) return Promise.resolve({});
        if (
          ids.length === 1 &&
          ids[0] === "response-2" &&
          includeResponses === false &&
          includeAttachments === false
        ) {
          return Promise.reject(new Error("Receipt request failed"));
        }
        return Promise.resolve({
          receipt: ids.join(","),
          responses: [{ id: ids[0], html: "response" }],
          attachments: [{ filename: "attachment.png" }],
        });
      }
    );

    await downloadResponses(createOptions(["response-1", "response-2"], onDownloadComplete));

    const zip = mocks.generateDownloadZip.mock.calls[0][0].zip;
    expect(zip.files["response-2.html"]).toBeDefined();
    expect(zip.files["_receipt-recu.html"]).toBeUndefined();
    expect(zip.files["RECOVERY-COPY-NOTE.txt"]).toBeDefined();
    expect(zip.files["errors-erreurs.json"]).toBeDefined();
    expect(mocks.getSubmissionsByFormat.mock.calls.some(([options]) => options.trackDownload)).toBe(
      false
    );
    expect(onDownloadComplete).toHaveBeenCalledWith([], {
      sizeLimitReached: false,
      processingFailed: true,
    });
  });

  it("propagates ZIP generation failures without marking responses as downloaded", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    const error = new Error("ZIP generation failed");
    mocks.generateDownloadZip.mockRejectedValueOnce(error);

    await expect(downloadResponses(createOptions(["response-1"], onDownloadComplete))).rejects.toBe(
      error
    );

    expect(mocks.getSubmissionsByFormat.mock.calls.some(([options]) => options.trackDownload)).toBe(
      false
    );
    expect(onDownloadComplete).not.toHaveBeenCalled();
  });

  it("fetches all responses in a single request when the form has no file inputs", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    mocks.getTemplateHasFileInput.mockResolvedValue(false);
    mocks.getSubmissionsByFormat.mockResolvedValue({
      receipt: "receipt",
      responses: [
        { id: "response-1", html: "response" },
        { id: "response-2", html: "response" },
      ],
      attachments: [],
    });

    await downloadResponses(createOptions(["response-1", "response-2"], onDownloadComplete));

    expect(mocks.getSubmissionsByFormat).toHaveBeenCalledTimes(1);
    expect(mocks.getSubmissionsByFormat.mock.calls[0][0]).toMatchObject({
      ids: ["response-1", "response-2"],
      includeAttachments: false,
      trackDownload: true,
    });
    expect(mocks.addResponseAttachmentsToZip).not.toHaveBeenCalled();
    expect(onDownloadComplete).toHaveBeenCalledWith(["response-1", "response-2"]);
  });

  it("falls back to sequential downloads when the file input check fails", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    mocks.getTemplateHasFileInput.mockResolvedValue(undefined);

    await downloadResponses(createOptions(["response-1", "response-2"], onDownloadComplete));

    const fetchCalls = mocks.getSubmissionsByFormat.mock.calls.filter(
      ([options]) => !options.trackDownload
    );
    expect(fetchCalls.map(([options]) => options.ids)).toEqual([
      ["response-1", "response-2"],
      ["response-1"],
      ["response-2"],
    ]);
  });

  const stubResponseSizes = (sizesInBytes: Record<string, number>) =>
    vi.stubGlobal(
      "TextEncoder",
      class extends OriginalTextEncoder {
        encode(input?: string): Uint8Array<ArrayBuffer> {
          if (input !== undefined && input in sizesInBytes) {
            return {
              byteLength: sizesInBytes[input],
            } as unknown as Uint8Array<ArrayBuffer>;
          }
          return super.encode(input);
        }
      }
    );

  const mockResponseHtml = (getHtml: (responseId: string) => string) =>
    mocks.getSubmissionsByFormat.mockImplementation(({ ids, trackDownload }) => {
      if (trackDownload) return Promise.resolve({});
      if (ids.length > 1 || ids.length === 0) {
        return Promise.resolve({ receipt: ids.join(","), responses: [], attachments: [] });
      }
      return Promise.resolve({
        receipt: ids.join(","),
        responses: [{ id: ids[0], html: getHtml(ids[0]) }],
        attachments: [],
      });
    });

  it("always downloads the first response even when it exceeds the ZIP size limit", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    stubResponseSizes({ "oversized response": RESPONSES_UI_ZIP_SIZE_LIMIT_BYTES * 1.2 });
    mockResponseHtml(() => "oversized response");

    try {
      await downloadResponses(createOptions(["response-1", "response-2"], onDownloadComplete));
    } finally {
      vi.unstubAllGlobals();
    }

    const responseFetches = mocks.getSubmissionsByFormat.mock.calls.filter(
      ([options]) =>
        options.ids.length === 1 && !options.trackDownload && options.includeResponses !== false
    );
    expect(responseFetches.map(([options]) => options.ids)).toEqual([["response-1"]]);
    const zip = mocks.generateDownloadZip.mock.calls[0][0].zip;
    expect(zip.files["response-1.html"]).toBeDefined();
    expect(zip.files["response-2.html"]).toBeUndefined();
    await expect(zip.files["_receipt-recu.html"].async("string")).resolves.toBe("response-1");
    const trackingCall = mocks.getSubmissionsByFormat.mock.calls.find(
      ([options]) => options.trackDownload
    );
    expect(trackingCall?.[0].ids).toEqual(["response-1"]);
    expect(onDownloadComplete).toHaveBeenCalledWith(["response-1"], {
      sizeLimitReached: true,
      processingFailed: false,
    });
  });

  it("downloads a single response that exceeds the ZIP size limit without failures", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    stubResponseSizes({ "oversized response": RESPONSES_UI_ZIP_SIZE_LIMIT_BYTES * 1.2 });
    mockResponseHtml(() => "oversized response");

    try {
      await downloadResponses(createOptions(["response-1"], onDownloadComplete));
    } finally {
      vi.unstubAllGlobals();
    }

    const zip = mocks.generateDownloadZip.mock.calls[0][0].zip;
    expect(zip.files["response-1.html"]).toBeDefined();
    expect(zip.files["errors-erreurs.json"]).toBeUndefined();
    expect(onDownloadComplete).toHaveBeenCalledWith(["response-1"], {
      sizeLimitReached: false,
      processingFailed: false,
    });
  });

  it("excludes later responses that would exceed the ZIP size limit", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    stubResponseSizes({
      "large response 1": RESPONSES_UI_ZIP_SIZE_LIMIT_BYTES / 2,
      "large response 2": RESPONSES_UI_ZIP_SIZE_LIMIT_BYTES / 2,
    });
    mockResponseHtml((responseId) =>
      responseId === "response-1" ? "large response 1" : "large response 2"
    );

    try {
      await downloadResponses(
        createOptions(["response-1", "response-2", "response-3"], onDownloadComplete)
      );
    } finally {
      vi.unstubAllGlobals();
    }

    const responseFetches = mocks.getSubmissionsByFormat.mock.calls.filter(
      ([options]) =>
        options.ids.length === 1 && !options.trackDownload && options.includeResponses !== false
    );
    expect(responseFetches.map(([options]) => options.ids)).toEqual([
      ["response-1"],
      ["response-2"],
    ]);
    const zip = mocks.generateDownloadZip.mock.calls[0][0].zip;
    expect(zip.files["response-1.html"]).toBeDefined();
    expect(zip.files["response-2.html"]).toBeUndefined();
    expect(onDownloadComplete).toHaveBeenCalledWith(["response-1"], {
      sizeLimitReached: true,
      processingFailed: false,
    });
  });

  it("reports both size-limit and processing issues when both occur", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    stubResponseSizes({ "oversized response": RESPONSES_UI_ZIP_SIZE_LIMIT_BYTES * 1.2 });
    mockResponseHtml(() => "oversized response");
    mocks.addResponseAttachmentsToZip
      .mockResolvedValueOnce([
        {
          code: "PROCESSING",
          responseId: "response-1",
          filename: "attachment.png",
          reason: "Download failed",
        },
      ])
      .mockResolvedValueOnce([]);

    try {
      await downloadResponses(
        createOptions(["response-1", "response-2", "response-3"], onDownloadComplete)
      );
    } finally {
      vi.unstubAllGlobals();
    }

    expect(onDownloadComplete).toHaveBeenCalledWith(["response-2"], {
      sizeLimitReached: true,
      processingFailed: true,
    });
  });
});
