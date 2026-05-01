import { fileGroupToFileTypes } from "./fileGroupsToFileTypes";
import { fileGroupsToFileTypes } from "./fileGroupsToFileTypes";
import { describe, it, expect } from "vitest";
import { FILE_GROUPS } from "./constants";

// Convert an array of file groups to an array of file types
describe("fileGroupsToFileTypes", () => {
  it("should convert file groups to file types", () => {
    const fileGroups = ["documents", "images"];
    const types = fileGroupsToFileTypes(fileGroups);
    expect(types).toEqual([...FILE_GROUPS.documents.types, ...FILE_GROUPS.images.types]);
  });

  it("should return an empty array for empty input", () => {
    const types = fileGroupsToFileTypes([]);
    expect(types).toEqual([]);
  });

  it("should handle unknown file groups gracefully", () => {
    const fileGroups = ["documents", "unknown"];
    const types = fileGroupsToFileTypes(fileGroups);
    expect(types).toEqual(FILE_GROUPS.documents.types);
  });
});

// Single file group to file types mapping
describe("fileGroupToFileTypes", () => {
  it("should return document file types for 'documents' group", () => {
    const types = fileGroupToFileTypes("documents");
    expect(types).toEqual(FILE_GROUPS.documents.types);
  });

  it("should return image file types for 'images' group", () => {
    const types = fileGroupToFileTypes("images");
    expect(types).toEqual(FILE_GROUPS.images.types);
  });

  it("should return spreadsheet file types for 'spreadsheets' group", () => {
    const types = fileGroupToFileTypes("spreadsheets");
    expect(types).toEqual(FILE_GROUPS.spreadsheets.types);
  });

  it("should return an empty array for unknown groups", () => {
    const types = fileGroupToFileTypes("unknown");
    expect(types).toEqual([]);
  });

  it("should return an empty array for empty string", () => {
    const types = fileGroupToFileTypes("");
    expect(types).toEqual([]);
  });
});
