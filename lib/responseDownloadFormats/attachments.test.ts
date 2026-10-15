import JSZip from "jszip";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addResponseAttachmentsToZip, getAttachmentZipPath } from "./attachments";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("response attachment ZIP paths", () => {
  it("puts attachments in a response-specific folder and deduplicates names", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => new TextEncoder().encode("attachment contents"),
      })
    );
    const zip = new JSZip();

    await addResponseAttachmentsToZip(zip, [
      {
        responseId: "response-1",
        attachments: [
          {
            id: "first",
            name: "document.pdf",
            downloadLink: "https://example.test/first",
            isPotentiallyMalicious: false,
          },
          {
            id: "second",
            name: "document.pdf",
            downloadLink: "https://example.test/second",
            isPotentiallyMalicious: false,
          },
        ],
      },
    ]);

    const contents = await zip.generateAsync({ type: "uint8array" });
    const loadedZip = await JSZip.loadAsync(contents);
    expect(Object.keys(loadedZip.files).filter((filename) => !filename.endsWith("/"))).toEqual([
      "file_attachments-fichiers_joints/response-1/document.pdf",
      "file_attachments-fichiers_joints/response-1/document (1).pdf",
    ]);
  });

  it("retries expired links and keeps successful files when another download fails", async () => {
    const mockResponse = (status: number, contents = "") => ({
      status,
      ok: status >= 200 && status < 300,
      statusText: "",
      blob: async () => new TextEncoder().encode(contents),
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse(403))
      .mockResolvedValueOnce(mockResponse(200, "first attachment"))
      .mockResolvedValueOnce(mockResponse(500));
    vi.stubGlobal("fetch", fetchMock);
    const refreshDownloadLink = vi.fn().mockResolvedValue("https://example.test/refreshed");
    const onProgress = vi.fn();
    const zip = new JSZip();

    const failures = await addResponseAttachmentsToZip(
      zip,
      [
        {
          responseId: "response-1",
          attachments: [
            {
              id: "first",
              name: "first.txt",
              downloadLink: "https://example.test/expired",
              isPotentiallyMalicious: false,
            },
            {
              id: "second",
              name: "second.txt",
              downloadLink: "https://example.test/second",
              isPotentiallyMalicious: false,
            },
          ],
        },
      ],
      { onProgress, refreshDownloadLink }
    );

    const contents = await zip.generateAsync({ type: "uint8array" });
    const loadedZip = await JSZip.loadAsync(contents);
    const manifest = await loadedZip.files["attachment-download-errors.json"].async("string");

    expect(fetchMock).toHaveBeenNthCalledWith(2, "https://example.test/refreshed");
    expect(refreshDownloadLink).toHaveBeenCalledWith("response-1", "first");
    expect(failures).toEqual([
      { responseId: "response-1", filename: "second.txt", reason: "HTTP 500" },
    ]);
    expect(Object.keys(loadedZip.files)).toContain(
      "file_attachments-fichiers_joints/response-1/first.txt"
    );
    expect(JSON.parse(manifest)).toEqual(failures);
    expect(onProgress).toHaveBeenLastCalledWith({
      completed: 2,
      total: 2,
      filename: "second.txt",
    });
  });

  it("downloads attachments one at a time", async () => {
    let activeDownloads = 0;
    let maxConcurrentDownloads = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        activeDownloads += 1;
        maxConcurrentDownloads = Math.max(maxConcurrentDownloads, activeDownloads);
        await Promise.resolve();
        activeDownloads -= 1;
        return {
          ok: true,
          status: 200,
          blob: async () => new TextEncoder().encode("attachment contents"),
        };
      })
    );

    await addResponseAttachmentsToZip(new JSZip(), [
      {
        responseId: "response-1",
        attachments: [
          {
            id: "first",
            name: "first.txt",
            downloadLink: "https://example.test/first",
            isPotentiallyMalicious: false,
          },
          {
            id: "second",
            name: "second.txt",
            downloadLink: "https://example.test/second",
            isPotentiallyMalicious: false,
          },
        ],
      },
    ]);

    expect(maxConcurrentDownloads).toBe(1);
  });

  it("places potentially malicious files in a nested suspicious folder", () => {
    const path = getAttachmentZipPath("response-1", "upload.exe", true, new Set(), 0);

    expect(path).toBe(
      "file_attachments-fichiers_joints/response-1/suspicious_files-fichiers_suspects/upload.exe"
    );
  });

  it("prevents attachment filenames from escaping the response folder", () => {
    const path = getAttachmentZipPath("response-1", "../../proof.pdf", false, new Set(), 0);

    expect(path).toBe("file_attachments-fichiers_joints/response-1/proof.pdf");
  });
});
