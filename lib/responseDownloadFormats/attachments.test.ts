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