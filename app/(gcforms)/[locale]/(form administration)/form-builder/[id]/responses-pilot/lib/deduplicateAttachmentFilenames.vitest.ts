import { describe, it, expect } from "vitest";
import { deduplicateAttachmentFilenames } from "./processResponse";
import type { CompleteAttachment } from "./types";

describe("deduplicateAttachmentFilenames", () => {
  it("should keep unique filenames unchanged", () => {
    const attachments = [
      { name: "file1.pdf", downloadLink: "link1", isPotentiallyMalicious: false },
      { name: "file2.jpg", downloadLink: "link2", isPotentiallyMalicious: false },
      { name: "file3.txt", downloadLink: "link3", isPotentiallyMalicious: false },
    ] as CompleteAttachment[];

    const result = deduplicateAttachmentFilenames(attachments);

    expect(result).toEqual([
      { name: "file1.pdf", downloadLink: "link1", isPotentiallyMalicious: false, renameTo: "file1.pdf" },
      { name: "file2.jpg", downloadLink: "link2", isPotentiallyMalicious: false, renameTo: "file2.jpg" },
      { name: "file3.txt", downloadLink: "link3", isPotentiallyMalicious: false, renameTo: "file3.txt" },
    ]);
  });

  it("should deduplicate identical filenames with counter", () => {
    const attachments = [
      { name: "document.pdf", downloadLink: "link1", isPotentiallyMalicious: false },
      { name: "document.pdf", downloadLink: "link2", isPotentiallyMalicious: false },
      { name: "document.pdf", downloadLink: "link3", isPotentiallyMalicious: false },
    ] as CompleteAttachment[];

    const result = deduplicateAttachmentFilenames(attachments);

    expect(result).toEqual([
      { name: "document.pdf", downloadLink: "link1", isPotentiallyMalicious: false, renameTo: "document.pdf" },
      { name: "document.pdf", downloadLink: "link2", isPotentiallyMalicious: false, renameTo: "document (1).pdf" },
      { name: "document.pdf", downloadLink: "link3", isPotentiallyMalicious: false, renameTo: "document (2).pdf" },
    ]);
  });

  it("should handle files without extensions", () => {
    const attachments = [
      { name: "README", downloadLink: "link1", isPotentiallyMalicious: false },
      { name: "README", downloadLink: "link2", isPotentiallyMalicious: false },
      { name: "LICENSE", downloadLink: "link3", isPotentiallyMalicious: false },
    ] as CompleteAttachment[];

    const result = deduplicateAttachmentFilenames(attachments);

    expect(result).toEqual([
      { name: "README", downloadLink: "link1", isPotentiallyMalicious: false, renameTo: "README" },
      { name: "README", downloadLink: "link2", isPotentiallyMalicious: false, renameTo: "README (1)" },
      { name: "LICENSE", downloadLink: "link3", isPotentiallyMalicious: false, renameTo: "LICENSE" },
    ]);
  });

  it("should handle mixed unique and duplicate filenames", () => {
    const attachments = [
      { name: "report.docx", downloadLink: "link1", isPotentiallyMalicious: false },
      { name: "image.png", downloadLink: "link2", isPotentiallyMalicious: false },
      { name: "report.docx", downloadLink: "link3", isPotentiallyMalicious: false },
      { name: "data.csv", downloadLink: "link4", isPotentiallyMalicious: false },
      { name: "image.png", downloadLink: "link5", isPotentiallyMalicious: false },
    ] as CompleteAttachment[];

    const result = deduplicateAttachmentFilenames(attachments);

    expect(result).toEqual([
      { name: "report.docx", downloadLink: "link1", isPotentiallyMalicious: false, renameTo: "report.docx" },
      { name: "image.png", downloadLink: "link2", isPotentiallyMalicious: false, renameTo: "image.png" },
      { name: "report.docx", downloadLink: "link3", isPotentiallyMalicious: false, renameTo: "report (1).docx" },
      { name: "data.csv", downloadLink: "link4", isPotentiallyMalicious: false, renameTo: "data.csv" },
      { name: "image.png", downloadLink: "link5", isPotentiallyMalicious: false, renameTo: "image (1).png" },
    ]);
  });

  it("should handle files with multiple dots in filename", () => {
    const attachments = [
      { name: "my.file.name.txt", downloadLink: "link3", isPotentiallyMalicious: false },
      { name: "my.file.name.txt", downloadLink: "link4", isPotentiallyMalicious: false },
    ] as CompleteAttachment[];

    const result = deduplicateAttachmentFilenames(attachments);

    expect(result).toEqual([
      { name: "my.file.name.txt", downloadLink: "link3", isPotentiallyMalicious: false, renameTo: "my.file.name.txt" },
      { name: "my.file.name.txt", downloadLink: "link4", isPotentiallyMalicious: false, renameTo: "my.file.name (1).txt" },
    ]);
  });

  it("should handle empty attachments array", () => {
    const attachments: CompleteAttachment[] = [];

    const result = deduplicateAttachmentFilenames(attachments);

    expect(result).toEqual([]);
  });

  it("should preserve isPotentiallyMalicious flag", () => {
    const attachments = [
      { name: "safe.pdf", downloadLink: "link1", isPotentiallyMalicious: false },
      { name: "suspicious.exe", downloadLink: "link2", isPotentiallyMalicious: true },
      { name: "suspicious.exe", downloadLink: "link3", isPotentiallyMalicious: true },
    ] as CompleteAttachment[];

    const result = deduplicateAttachmentFilenames(attachments);

    expect(result).toEqual([
      { name: "safe.pdf", downloadLink: "link1", isPotentiallyMalicious: false, renameTo: "safe.pdf" },
      { name: "suspicious.exe", downloadLink: "link2", isPotentiallyMalicious: true, renameTo: "suspicious.exe" },
      { name: "suspicious.exe", downloadLink: "link3", isPotentiallyMalicious: true, renameTo: "suspicious (1).exe" },
    ]);
  });

  it("should handle many duplicates sequentially", () => {
    const attachments = [
      { name: "file.txt", downloadLink: "link1", isPotentiallyMalicious: false },
      { name: "file.txt", downloadLink: "link2", isPotentiallyMalicious: false },
      { name: "file.txt", downloadLink: "link3", isPotentiallyMalicious: false },
      { name: "file.txt", downloadLink: "link4", isPotentiallyMalicious: false },
      { name: "file.txt", downloadLink: "link5", isPotentiallyMalicious: false },
    ] as CompleteAttachment[];

    const result = deduplicateAttachmentFilenames(attachments);

    expect(result).toEqual([
      { name: "file.txt", downloadLink: "link1", isPotentiallyMalicious: false, renameTo: "file.txt" },
      { name: "file.txt", downloadLink: "link2", isPotentiallyMalicious: false, renameTo: "file (1).txt" },
      { name: "file.txt", downloadLink: "link3", isPotentiallyMalicious: false, renameTo: "file (2).txt" },
      { name: "file.txt", downloadLink: "link4", isPotentiallyMalicious: false, renameTo: "file (3).txt" },
      { name: "file.txt", downloadLink: "link5", isPotentiallyMalicious: false, renameTo: "file (4).txt" },
    ]);
  });

  it("should handle filenames starting with a dot", () => {
    const attachments = [
      { name: ".gitignore", downloadLink: "link1", isPotentiallyMalicious: false },
      { name: ".gitignore", downloadLink: "link2", isPotentiallyMalicious: false },
      { name: ".env", downloadLink: "link3", isPotentiallyMalicious: false },
    ] as CompleteAttachment[];

    const result = deduplicateAttachmentFilenames(attachments);

    expect(result).toEqual([
      { name: ".gitignore", downloadLink: "link1", isPotentiallyMalicious: false, renameTo: ".gitignore" },
      { name: ".gitignore", downloadLink: "link2", isPotentiallyMalicious: false, renameTo: " (1).gitignore" },
      { name: ".env", downloadLink: "link3", isPotentiallyMalicious: false, renameTo: ".env" },
    ]);
  });
});
