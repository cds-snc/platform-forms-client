import { describe, expect, it } from "vitest";
import { getVersionedZipFileName } from "./DownloadDialog";

describe("getVersionedZipFileName", () => {
  it("adds the version suffix before the zip extension", () => {
    expect(getVersionedZipFileName("responses-reponses.zip", "v3")).toBe(
      "responses-reponses-v3.zip"
    );
  });

  it("leaves the base filename unchanged without a version", () => {
    expect(getVersionedZipFileName("responses-reponses.zip", null)).toBe("responses-reponses.zip");
  });
});
