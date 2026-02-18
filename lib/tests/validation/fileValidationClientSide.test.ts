import { isFileExtensionValid } from "@gcforms/core";

describe("File extension validator", () => {
  it.each([
    ["pdf", true],
    ["txt", true],
    ["csv", true],
    ["doc", true],
    ["docx", true],
    ["jpg", true],
    ["png", true],
    ["PDF", true],
    ["CSV", true],
    ["ca", false],
    ["reg", false],
    ["mov", false],
    ["mp3", false],
    ["tar", false],
    ["zip", false],
    ["xml", false],
    ["svg", false],
    ["numbers", false],
  ])(`Should return true if file extension is valid (testing "%s")`, async (extension, isValid) => {
    expect(isFileExtensionValid(`file.${extension}`)).toBe(isValid);
  });
});
