import { fileTypeFromBuffer } from "file-type";
import {
  FileValidationResult,
  validateFileToUpload,
} from "@lib/validation/fileValidationServerSide";
import { vi } from "vitest";

vi.mock("file-type");
const mockFileTypeFromBuffer = vi.mocked(fileTypeFromBuffer);

describe("Regarless of the MIME type detection, it", () => {
  beforeAll(() => {
    mockFileTypeFromBuffer.mockResolvedValueOnce(undefined);
  });

  it("should return a VALID result if the size and the extension are both valid", async () => {
    const sut = await validateFileToUpload(
      "fileName.txt",
      100,
      Buffer.from("dGhpcyBpcyBhIG1lc3NhZ2U=")
    );

    expect(sut.result).toEqual(FileValidationResult.VALID);
  });

  it("should return a SIZE_IS_TOO_LARGE result if the given size is too large", async () => {
    const sut = await validateFileToUpload(
      "fileName.txt",
      8000001,
      Buffer.from("dGhpcyBpcyBhIG1lc3NhZ2U=")
    );

    expect(sut.result).toEqual(FileValidationResult.SIZE_IS_TOO_LARGE);
    expect(sut.detectedValue).toEqual("8000001 (fileSize) / 24 (sizeOfBuffer)");
  });

  it("should return a SIZE_IS_TOO_LARGE result if the buffer size is too large", async () => {
    const sut = await validateFileToUpload("fileName.txt", 100, Buffer.alloc(8000001));

    expect(sut.result).toEqual(FileValidationResult.SIZE_IS_TOO_LARGE);
    expect(sut.detectedValue).toEqual("100 (fileSize) / 8000001 (sizeOfBuffer)");
  });

  it("should return an INVALID_EXTENSION result if the given fileName has an invalid extension", async () => {
    const sut = await validateFileToUpload(
      "fileName.zip",
      100,
      Buffer.from("dGhpcyBpcyBhIG1lc3NhZ2U=")
    );

    expect(sut.result).toEqual(FileValidationResult.INVALID_EXTENSION);
    expect(sut.detectedValue).toEqual("fileName.zip");
  });
});

describe("When given file has detectable MIME type", () => {
  it("should return a VALID result if the size, extension and MIME type are valid", async () => {
    mockFileTypeFromBuffer.mockResolvedValueOnce({ ext: "pdf", mime: "application/pdf" });

    const sut = await validateFileToUpload(
      "fileName.pdf",
      100,
      Buffer.from("dGhpcyBpcyBhIG1lc3NhZ2U=")
    );

    expect(sut.result).toEqual(FileValidationResult.VALID);
  });

  it("should return an INVALID_EXTENSION result if the detected extension is invalid", async () => {
    mockFileTypeFromBuffer.mockResolvedValueOnce({ ext: "zip", mime: "application/pdf" });

    const sut = await validateFileToUpload(
      "fileName.pdf",
      100,
      Buffer.from("dGhpcyBpcyBhIG1lc3NhZ2U=")
    );

    expect(sut.result).toEqual(FileValidationResult.INVALID_EXTENSION);
    expect(sut.detectedValue).toEqual("zip");
  });

  it("should return an INVALID_MIME_TYPE result if the detected MIME type is invalid", async () => {
    mockFileTypeFromBuffer.mockResolvedValueOnce({ ext: "pdf", mime: "application/zip" });

    const sut = await validateFileToUpload(
      "fileName.pdf",
      100,
      Buffer.from("dGhpcyBpcyBhIG1lc3NhZ2U=")
    );

    expect(sut.result).toEqual(FileValidationResult.INVALID_MIME_TYPE);
    expect(sut.detectedValue).toEqual("application/zip");
  });
});
