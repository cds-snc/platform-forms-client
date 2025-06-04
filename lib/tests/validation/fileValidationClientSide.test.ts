import {
  isFileExtensionValid,
  isIndividualFileSizeValid,
} from "@lib/validation/fileValidationClientSide";

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
    ["xml", true],
  ])(`Should return true if file extension is valid (testing "%s")`, async (extension, isValid) => {
    expect(isFileExtensionValid(`file.${extension}`)).toBe(isValid);
  });
});

describe("File size validator", () => {
  it.each([
    [1000, true],
    [5000000, true],
    [8389121, true],
    [11534336, false],
  ])(`Should return true if file size is valid (testing "%s")`, async (fileSize, isValid) => {
    expect(isIndividualFileSizeValid(fileSize)).toBe(isValid);
  });
});
