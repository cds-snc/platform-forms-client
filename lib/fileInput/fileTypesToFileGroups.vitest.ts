import { toFileGroup } from "./fileTypesToFileGroups";
import { describe, it, expect } from "vitest";
import { FILE_GROUPS } from "./constants";

import { fileTypesToFileGroups } from "./fileTypesToFileGroups";

// Convert an file types to its corresponding file groups
describe("fileTypesToFileGroups", () => {
  it("should convert file types to file groups", () => {
    const fileTypes = ["pdf", "jpg", "xlsx"];
    const groups = fileTypesToFileGroups(fileTypes);
    expect(groups).toEqual(["documents", "images", "spreadsheets"]);
  });
  it("should return an empty array for empty input", () => {
    const groups = fileTypesToFileGroups([]);
    expect(groups).toEqual([]);
  });
  it("should handle unknown file types gracefully", () => {
    const fileTypes = ["pdf", "unknown"];
    const groups = fileTypesToFileGroups(fileTypes);
    expect(groups).toEqual(["documents"]);
  });
  it("should handle mixed known and unknown file types", () => {
    const fileTypes = ["pdf", "jpg", "unknown"];
    const groups = fileTypesToFileGroups(fileTypes);
    expect(groups).toEqual(["documents", "images"]);
  });
  it("should return an empty array for all unknown file types", () => {
    const fileTypes = ["unknown1", "unknown2"];
    const groups = fileTypesToFileGroups(fileTypes);
    expect(groups).toEqual([]);
  });
});

// Converts a single file type to its corresponding file group
describe("toFileGroup", () => {
  it("should return 'documents' for document file types", () => {
    FILE_GROUPS.documents.types.forEach((type) => {
      expect(toFileGroup(type)).toBe("documents");
    });
  });

  it("should return 'images' for image file types", () => {
    FILE_GROUPS.images.types.forEach((type) => {
      expect(toFileGroup(type)).toBe("images");
    });
  });

  it("should return 'spreadsheets' for spreadsheet file types", () => {
    FILE_GROUPS.spreadsheets.types.forEach((type) => {
      expect(toFileGroup(type)).toBe("spreadsheets");
    });
  });

  it("should return null for unknown file types", () => {
    expect(toFileGroup("unknown")).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(toFileGroup("")).toBeNull();
  });
});
