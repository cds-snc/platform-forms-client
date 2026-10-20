import { beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadFormat } from "@lib/responseDownloadFormats/types";
import type { DownloadResponsesOptions } from "./DownloadDialog.types";

const mocks = vi.hoisted(() => ({
  addResponseAttachmentsToZip: vi.fn(),
  createRecoveryCopy: vi.fn(),
  ga: vi.fn(),
  generateDownloadZip: vi.fn(),
  getSubmissionsByFormat: vi.fn(),
  getTemplateHasFileInput: vi.fn(),
}));

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
    createRecoveryCopy: mocks.createRecoveryCopy,
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
    mocks.createRecoveryCopy.mockResolvedValue(new Blob());
    mocks.generateDownloadZip.mockResolvedValue(false);
  });

  it("tracks only responses whose attachments were included", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    mocks.addResponseAttachmentsToZip
      .mockResolvedValueOnce([
        { responseId: "response-1", filename: "attachment.png", reason: "Download failed" },
      ])
      .mockResolvedValueOnce([]);

    await downloadResponses(createOptions(["response-1", "response-2"], onDownloadComplete));

    const trackingCall = mocks.getSubmissionsByFormat.mock.calls.find(
      ([options]) => options.trackDownload
    );
    expect(trackingCall?.[0].ids).toEqual(["response-2"]);
    expect(onDownloadComplete).toHaveBeenCalledWith(["response-2"], true);
    const zip = mocks.generateDownloadZip.mock.calls[0][0].zip;
    expect(zip.files["response-1.html"]).toBeUndefined();
    expect(zip.files["response-2.html"]).toBeDefined();
    await expect(zip.files["_receipt-recu.html"].async("string")).resolves.toBe("response-2");
  });

  it("does not track responses when a recovery copy is downloaded", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    mocks.generateDownloadZip.mockResolvedValue(true);

    await downloadResponses(createOptions(["response-1"], onDownloadComplete));

    expect(mocks.getSubmissionsByFormat.mock.calls.some(([options]) => options.trackDownload)).toBe(
      false
    );
    expect(onDownloadComplete).toHaveBeenCalledWith([], true);
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

  it("stops fetching responses when an entry exceeds the ZIP size limit", async () => {
    const onDownloadComplete = vi.fn<DownloadResponsesOptions["onDownloadComplete"]>();
    mocks.getSubmissionsByFormat.mockImplementation(({ ids, trackDownload }) => {
      if (trackDownload) return Promise.resolve({});
      if (ids.length > 1) {
        return Promise.resolve({ receipt: "receipt", responses: [], attachments: [] });
      }
      return Promise.resolve({
        receipt: "receipt",
        responses: [{ id: ids[0], html: "x".repeat(14 * 1024 * 1024) }],
        attachments: [],
      });
    });

    await downloadResponses(createOptions(["response-1", "response-2"], onDownloadComplete));

    const responseFetches = mocks.getSubmissionsByFormat.mock.calls.filter(
      ([options]) => options.ids.length === 1 && !options.trackDownload
    );
    expect(responseFetches.map(([options]) => options.ids)).toEqual([["response-1"]]);
    expect(mocks.createRecoveryCopy).not.toHaveBeenCalled();
    expect(
      mocks.generateDownloadZip.mock.calls[0][0].zip.files["_receipt-recu.html"]
    ).toBeUndefined();
    expect(onDownloadComplete).toHaveBeenCalledWith([], true);
  });
});
