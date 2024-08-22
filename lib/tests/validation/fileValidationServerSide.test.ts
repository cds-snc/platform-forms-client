import { fileTypeFromBuffer } from "file-type";
import { validateFileToUpload } from "@lib/validation/fileValidationServerSide";

jest.mock("file-type");
const mockFileTypeFromBuffer = jest.mocked(fileTypeFromBuffer, { shallow: true });

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

    expect(sut).toStrictEqual({ status: "valid" });
  });

  it("should return a SIZE_IS_TOO_LARGE result if the given size is too large", async () => {
    const sut = await validateFileToUpload(
      "fileName.txt",
      8389121,
      Buffer.from("dGhpcyBpcyBhIG1lc3NhZ2U=")
    );

    expect(sut).toStrictEqual({
      status: "size-is-too-large",
      fileSizeInBytes: 8389121,
      sizeOfProcessedFileDataBuffer: 24,
    });
  });

  it("should return a SIZE_IS_TOO_LARGE result if the buffer size is too large", async () => {
    const sut = await validateFileToUpload("fileName.txt", 100, Buffer.alloc(8389121));

    expect(sut).toStrictEqual({
      status: "size-is-too-large",
      fileSizeInBytes: 100,
      sizeOfProcessedFileDataBuffer: 8389121,
    });
  });

  it("should return an INVALID_GIVEN_EXTENSION result if the given fileName has an invalid extension", async () => {
    const sut = await validateFileToUpload(
      "fileName.zip",
      100,
      Buffer.from("dGhpcyBpcyBhIG1lc3NhZ2U=")
    );

    expect(sut).toStrictEqual({
      status: "invalid-given-extension",
      fileName: "fileName.zip",
    });
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

    expect(sut).toStrictEqual({ status: "valid" });
  });

  it("should return an INVALID_MIME_ASSOCIATED_EXTENSION result if the detected extension is invalid", async () => {
    mockFileTypeFromBuffer.mockResolvedValueOnce({ ext: "zip", mime: "application/pdf" });

    const sut = await validateFileToUpload(
      "fileName.pdf",
      100,
      Buffer.from("dGhpcyBpcyBhIG1lc3NhZ2U=")
    );

    expect(sut).toStrictEqual({
      status: "invalid-mime-associated-extension",
      mimeType: "application/pdf",
      associatedExtension: "zip",
    });
  });

  it("should return an INVALID_MIME_TYPE result if the detected MIME type is invalid", async () => {
    mockFileTypeFromBuffer.mockResolvedValueOnce({ ext: "pdf", mime: "application/zip" });

    const sut = await validateFileToUpload(
      "fileName.pdf",
      100,
      Buffer.from("dGhpcyBpcyBhIG1lc3NhZ2U=")
    );

    expect(sut).toStrictEqual({
      status: "invalid-mime-type",
      mimeType: "application/zip",
    });
  });
});
