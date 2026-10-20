import { beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadFormat } from "@lib/responseDownloadFormats/types";
import type { DownloadResponsesOptions } from "./DownloadDialog.types";

const mocks = vi.hoisted(() => ({
  addResponseAttachmentsToZip: vi.fn(),
  createRecoveryCopy: vi.fn(),
  ga: vi.fn(),
  generateDownloadZip: vi.fn(),
  getSubmissionsByFormat: vi.fn(),
}));

vi.mock("@lib/client/clientHelpers", () => ({ ga: mocks.ga }));
vi.mock("@lib/responseDownloadFormats/attachments", () => ({
  addResponseAttachmentsToZip: mocks.addResponseAttachmentsToZip,
}));
vi.mock("../../../actions", () => ({ getSubmissionsByFormat: mocks.getSubmissionsByFormat }));
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
    mocks.getSubmissionsByFormat.mockImplementation(({ trackDownload }) =>
      trackDownload
        ? Promise.resolve({})
        : Promise.resolve({
            receipt: "receipt",
            responses: [{ id: "response-1", html: "response" }],
            attachments: [{ filename: "attachment.png" }],
          })
    );
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
});
