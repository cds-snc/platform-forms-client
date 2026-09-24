import { describe, it, expect } from "vitest";
import { type FormProperties } from "@gcforms/types";
import { addSchemaVersionProperty } from "./v0001_addSchemaVersionProperty";

const baseTemplate = {
  titleEn: "Title",
  titleFr: "Titre",
  layout: [],
  elements: [],
} as unknown as FormProperties;

describe("addSchemaVersionProperty", () => {
  it("stamps an explicit schemaVersion 1 without changing anything else", () => {
    const migrated = addSchemaVersionProperty(baseTemplate);
    expect(migrated).toEqual({ ...baseTemplate, schemaVersion: 1 });
  });
});
