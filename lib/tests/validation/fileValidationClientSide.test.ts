import { isFileExtensionValid, isFileSizeValid } from "@lib/validation/fileValidationClientSide";

describe("File extension validator", () => {
  it.each([
    ["pdf", true],
    ["txt", true],
    ["csv", true],
    ["doc", true],
    ["docx", true],
    ["jpg", true],
    ["png", true],
    ["numbers", true],
    ["PDF", true],
    ["CSV", true],
    ["ca", false],
    ["reg", false],
    ["mov", false],
    ["mp3", false],
    ["tar", false],
    ["zip", false],
  ])(`Should return true if file extension is valid (testing "%s")`, async (extension, isValid) => {
    expect(isFileExtensionValid(`file.${extension}`)).toBe(isValid);
  });
});

describe("File size validator", () => {
  it.each([
    [1000, true],
    [8000000, true],
    [8000001, false],
    [10000000, false],
  ])(`Should return true if file size is valid (testing "%s")`, async (fileSize, isValid) => {
    expect(isFileSizeValid(fileSize)).toBe(isValid);
  });
});
