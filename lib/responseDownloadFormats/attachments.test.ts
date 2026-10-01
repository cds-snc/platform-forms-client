import JSZip from "jszip";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addResponseAttachmentsToZip,
  getAttachmentZipPath,
  getUniqueAttachmentFilename,
} from "./attachments";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("response attachment ZIP paths", () => {
  it("keeps attachments below the response folder", () => {
    const path = getAttachmentZipPath("response-1", "../../proof.pdf", false, new Set<string>(), 0);

    expect(path).toBe("file_attachments-fichiers_joints/response-1/proof.pdf");
  });

  it("places potentially malicious attachments in the suspicious folder", () => {
    const path = getAttachmentZipPath("response-1", "upload.exe", true, new Set<string>(), 0);

    expect(path).toBe(
      "file_attachments-fichiers_joints/response-1/suspicious_files-fichiers_suspects/upload.exe"
    );
  });

  it("deduplicates filenames within a response", () => {
    const usedNames = new Set<string>();

    expect(getUniqueAttachmentFilename("document.pdf", usedNames, 0)).toBe("document.pdf");
    expect(getUniqueAttachmentFilename("document.pdf", usedNames, 1)).toBe("document (1).pdf");
  });

  it("fetches attachments into the response folder in a ZIP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        blob: async () => new TextEncoder().encode("attachment contents"),
      })
    );

    const zip = new JSZip();
    await addResponseAttachmentsToZip(zip, [
      {
        responseId: "response-1",
        attachments: [
          { id: "one", name: "document.pdf", downloadLink: "https://example.test/one" },
          { id: "two", name: "document.pdf", downloadLink: "https://example.test/two" },
        ],
      },
    ]);

    const generated = await zip.generateAsync({ type: "uint8array" });
    const loadedZip = await JSZip.loadAsync(generated);

    expect(Object.keys(loadedZip.files).filter((filename) => !filename.endsWith("/"))).toEqual([
      "file_attachments-fichiers_joints/response-1/document.pdf",
      "file_attachments-fichiers_joints/response-1/document (1).pdf",
    ]);
    expect(
      await loadedZip
        .file("file_attachments-fichiers_joints/response-1/document.pdf")
        ?.async("string")
    ).toBe("attachment contents");
  });

  it("fetches a single response's attachments at the ZIP root", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        blob: async () => new TextEncoder().encode("attachment contents"),
      })
    );

    const zip = new JSZip();
    await addResponseAttachmentsToZip(
      zip,
      [
        {
          responseId: "response-1",
          attachments: [
            { id: "one", name: "document.pdf", downloadLink: "https://example.test/one" },
            { id: "two", name: "document.pdf", downloadLink: "https://example.test/two" },
          ],
        },
      ],
      true
    );

    const generated = await zip.generateAsync({ type: "uint8array" });
    const loadedZip = await JSZip.loadAsync(generated);

    expect(Object.keys(loadedZip.files).filter((filename) => !filename.endsWith("/"))).toEqual([
      "document.pdf",
      "document (1).pdf",
    ]);
  });
});
